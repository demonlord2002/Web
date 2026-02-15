import re
import os
import aiohttp
import asyncio
from datetime import datetime, timedelta

from pymongo import MongoClient, ASCENDING
from pyrogram import Client, filters
from pyrogram.enums import ChatAction
from pyrogram.types import InlineKeyboardMarkup, Message

from config import MONGO_URL
from RAUSHAN import AMBOT
from RAUSHAN.modules.helpers import CHATBOT_ON, is_admins


# =========================================================
# GROQ CONFIG (OPTIMIZED)
# =========================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# 🔥 Smaller model (Huge token savings)
AI_MODEL = "llama-3.1-8b-instant"


# =========================================================
# DATABASE
# =========================================================

mongo = MongoClient(MONGO_URL)
db = mongo["Word"]
chatai = db["WordDb"]
vick = mongo["VickDb"]["Vick"]

chatai.create_index([("chat_id", ASCENDING), ("word", ASCENDING)])
chatai.create_index("learned_at")


# =========================================================
# SETTINGS
# =========================================================

LINK_PATTERN = re.compile(r"(https?:\/\/\S+|t\.me\/\S+)", re.IGNORECASE)
TAMIL_PATTERN = re.compile(r"[\u0B80-\u0BFF]")

CHAT_COOLDOWN = {}
COOLDOWN_SECONDS = 2
LEARN_LIMIT_PER_HOUR = 150


# =========================================================
# UTIL FUNCTIONS
# =========================================================

def normalize(text: str):
    return text.lower().strip() if text else None


def is_tamil(text: str):
    return bool(TAMIL_PATTERN.search(text)) if text else False


def should_use_ai(text: str):
    """🔥 Smart AI Trigger (Token Saver)"""

    if not text:
        return False

    text_lower = text.lower()
    words = text_lower.split()

    # Small talk skip AI
    if len(words) <= 3:
        return False

    # Coding keywords
    coding_keys = [
        "python", "code", "error", "api",
        "mongodb", "bot", "function", "async",
        "javascript", "html", "css"
    ]

    # Emotional deep triggers
    emotional_keys = [
        "love", "miss", "sad", "cry",
        "hurt", "relationship", "feel",
        "why", "explain"
    ]

    if any(k in text_lower for k in coding_keys):
        return True

    if any(k in text_lower for k in emotional_keys):
        return True

    if is_tamil(text):
        return True

    # If message length big
    if len(words) > 5:
        return True

    return False


def can_reply(chat_id: int):
    now = datetime.utcnow()
    last = CHAT_COOLDOWN.get(chat_id)

    if last and (now - last).total_seconds() < COOLDOWN_SECONDS:
        return False

    CHAT_COOLDOWN[chat_id] = now
    return True


def learning_allowed(chat_id: int):
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)

    count = chatai.count_documents({
        "chat_id": chat_id,
        "learned_at": {"$gte": one_hour_ago}
    })

    return count < LEARN_LIMIT_PER_HOUR


# =========================================================
# GROQ AI FUNCTION (LOW TOKEN MODE)
# =========================================================

async def get_ai_reply(user_text: str, chat_id: int, retry=False):

    if not GROQ_API_KEY:
        return None

    # 🔥 Reduced memory injection (only 2)
    recent_memory = chatai.find(
        {"chat_id": chat_id}
    ).sort("learned_at", -1).limit(2)

    memory_context = "\n".join(
        [f"{doc.get('word')} → {doc.get('text')}" for doc in recent_memory]
    )

    personality_prompt = f"""
You are a modern Chennai Tamil girl.
Speak natural Thanglish.
Be emotional, intelligent and short.
Good at coding answers.
No Hindi unless user speaks Hindi.
Memory:
{memory_context}
"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": AI_MODEL,
        "messages": [
            {"role": "system", "content": personality_prompt},
            {"role": "user", "content": user_text}
        ],
        "temperature": 0.7,
        "max_tokens": 120  # 🔥 Reduced
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                GROQ_URL,
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=20)
            ) as response:

                data = await response.json()

                # 🔥 Auto retry on rate limit
                if "error" in data:
                    if "rate_limit_exceeded" in str(data["error"]):
                        if not retry:
                            await asyncio.sleep(30)
                            return await get_ai_reply(user_text, chat_id, retry=True)
                        return None

                if "choices" in data and data["choices"]:
                    return data["choices"][0]["message"]["content"]

                return None

    except Exception:
        return None


# =========================================================
# ENABLE / DISABLE COMMAND
# =========================================================

@AMBOT.on_message(filters.command(["chatbot"]) & filters.group & ~filters.bot)
@is_admins
async def chatbot_toggle(_, message: Message):
    await message.reply_text(
        f"Chat ID: `{message.chat.id}`\nChoose option below:",
        reply_markup=InlineKeyboardMarkup(CHATBOT_ON),
    )


# =========================================================
# MAIN CHATBOT HANDLER (LOGIC SAME)
# =========================================================

@AMBOT.on_message((filters.text | filters.sticker) & ~filters.bot)
async def chatbot_handler(client: Client, message: Message):

    chat_id = message.chat.id

    if message.text and message.text.startswith(("!", "/", "@", "#", "?")):
        return

    if vick.find_one({"chat_id": chat_id}):
        return

    async def reply_from_db_or_ai(key):

        if not key:
            return

        if not can_reply(chat_id):
            return

        key = normalize(key)

        pipeline = [
            {"$match": {"chat_id": chat_id, "word": key}},
            {"$sample": {"size": 1}}
        ]

        result = list(chatai.aggregate(pipeline))

        if result:
            chosen = result[0]
            reply_type = chosen.get("check")
            reply_value = chosen.get("text")

            await client.send_chat_action(chat_id, ChatAction.TYPING)

            if reply_type == "sticker":
                await message.reply_sticker(reply_value)
            else:
                await message.reply_text(reply_value)
            return

        # 🔥 Only call AI if needed
        if isinstance(key, str) and should_use_ai(key):

            await client.send_chat_action(chat_id, ChatAction.TYPING)

            ai_reply = await get_ai_reply(key, chat_id)

            if ai_reply:
                await message.reply_text(ai_reply)

                if learning_allowed(chat_id):
                    chatai.update_one(
                        {"chat_id": chat_id, "word": key},
                        {
                            "$set": {
                                "text": ai_reply,
                                "check": "text",
                                "learned_at": datetime.utcnow()
                            }
                        },
                        upsert=True
                    )

    async def learn_response(key, text=None, sticker=None):

        if not key or not learning_allowed(chat_id):
            return

        key = normalize(key)

        if text and not LINK_PATTERN.search(text):
            chatai.update_one(
                {"chat_id": chat_id, "word": key},
                {
                    "$set": {
                        "text": text,
                        "check": "text",
                        "learned_at": datetime.utcnow()
                    }
                },
                upsert=True
            )

        if sticker:
            chatai.update_one(
                {"chat_id": chat_id, "word": key},
                {
                    "$set": {
                        "text": sticker.file_id,
                        "check": "sticker",
                        "learned_at": datetime.utcnow()
                    }
                },
                upsert=True
            )

    # =====================================================
    # LOGIC FLOW (UNCHANGED)
    # =====================================================

    if not message.reply_to_message:
        key = message.text or (
            message.sticker.file_unique_id if message.sticker else None
        )
        await reply_from_db_or_ai(key)

    elif message.reply_to_message.from_user.id == client.id:
        key = message.text or (
            message.sticker.file_unique_id if message.sticker else None
        )
        await reply_from_db_or_ai(key)

    else:
        replied = message.reply_to_message

        key = replied.text or (
            replied.sticker.file_unique_id if replied.sticker else None
        )

        if message.text:
            await learn_response(key, text=message.text)

        if message.sticker:
            await learn_response(key, sticker=message.sticker)
