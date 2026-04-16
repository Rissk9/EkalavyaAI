"""
Singleton module – creates LLM, embeddings, and vectorstore ONCE at startup.
All other modules import from here.

The vectorstore and retriever are optional — if no resume PDF is found
or embeddings fail, the app still starts and works (just without RAG context).
"""
import os
from functools import lru_cache
from typing import Optional

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS

from backend.config import get_settings


@lru_cache
def get_llm() -> ChatOpenAI:
    s = get_settings()
    return ChatOpenAI(
        base_url=s.llm_base_url,
        api_key=s.llm_api_key,
        model=s.llm_model,
        temperature=s.llm_temperature,
    )


@lru_cache
def get_embeddings() -> OpenAIEmbeddings:
    s = get_settings()
    return OpenAIEmbeddings(
        model=s.embedding_model,
        base_url=s.embedding_base_url,
        api_key=s.embedding_api_key,
    )


@lru_cache
def get_vectorstore() -> Optional[FAISS]:
    """Build FAISS vectorstore from resume_text in Supabase. Returns None if unavailable."""
    from backend.database import db_manager
    
    try:
        user_data = db_manager.get_user_data()
        if not user_data or not user_data.get("resume_text"):
            print("[INFO] No resume_text found in database -- running without RAG context")
            return None
            
        resume_text = user_data["resume_text"]
        
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        texts = splitter.split_text(resume_text)

        if not texts:
            print("[WARN] Resume text is empty after splitting -- running without RAG context")
            return None

        vectorstore = FAISS.from_texts(texts, get_embeddings())
        print(f"[OK] Vectorstore built from database resume ({len(texts)} chunks)")
        return vectorstore

    except Exception as e:
        print(f"[WARN] Failed to build vectorstore from DB: {e} -- running without RAG context")
        return None

def reload_retriever():
    """Clear caches to force rebuild of the vectorstore on next fetch."""
    get_vectorstore.cache_clear()
    get_retriever.cache_clear()
    # Pre-warm the cache immediately
    get_vectorstore()


@lru_cache
def get_retriever():
    """Return retriever if vectorstore is available, otherwise None."""
    vs = get_vectorstore()
    if vs is None:
        return None
    return vs.as_retriever(search_kwargs={"k": 3})
