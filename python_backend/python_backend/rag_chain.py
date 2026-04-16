import os
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq


class RAGChain:
    def __init__(self):
        # Embeddings
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        # LLM
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0,
            api_key=os.getenv("GROQ_API_KEY"),
        )

        # Storage
        self.vector_stores = {}
        self.indexes_folder = "indexes"
        Path(self.indexes_folder).mkdir(exist_ok=True)

    def create_index_from_text(self, text, index_name):
        """
        Create FAISS index from text using batched embeddings
        """
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150,
        )

        chunks = splitter.split_text(text)
        print(f"Total chunks: {len(chunks)}")

        if not chunks:
            raise ValueError("No chunks created from text")

        vector_store = None
        batch_size = 50

        for i in range(0, len(chunks), batch_size):
            batch = chunks[i : i + batch_size]

            if vector_store is None:
                vector_store = FAISS.from_texts(batch, self.embeddings)
            else:
                vector_store.add_texts(batch)

            print(f"Indexed chunks {i} → {i + len(batch)}")

        vector_store.save_local(
            os.path.join(self.indexes_folder, index_name)
        )

        self.vector_stores[index_name] = vector_store
        return vector_store

    def load_index(self, index_name):
        """
        Load FAISS index from disk
        """
        index_path = os.path.join(self.indexes_folder, index_name)

        if os.path.exists(index_path):
            vector_store = FAISS.load_local(
                index_path,
                self.embeddings,
                allow_dangerous_deserialization=True,
            )
            self.vector_stores[index_name] = vector_store
            print(f"Loaded index from {index_path}")
            return vector_store

        print(f"Index path {index_path} does not exist.")
        return None

    def load_all_indexes(self, index_names):
        """
        Load multiple FAISS indexes
        """
        for index_name in index_names:
            self.load_index(index_name)

    def answer_question(self, question, index_name):
        """
        Answer question strictly from a specific PDF index
        """

        # Ensure index is loaded
        if index_name not in self.vector_stores:
            self.load_index(index_name)

        if index_name not in self.vector_stores:
            return "📚 This material is not available."

        vector_store = self.vector_stores[index_name]

        # Retrieve relevant chunks
        docs = vector_store.similarity_search_with_relevance_scores(
            question, k=5
        )

        if not docs or docs[0][1] <= 0.0:
            return (
                "📚 This topic is not covered in the material. "
                "Try rephrasing your question."
            )

        # Filter high-confidence matches
        relevant_docs = [
            doc.page_content for doc, score in docs if score > 0.0
        ]

        context = "\n\n---\n\n".join(relevant_docs)

        # Strict prompt
        system_prompt = (
        "You are a friendly and professional AI assistant for luv2play, "
        "a platform focused on kids games & activities.\n\n"
        "Your job is to help parents, kids, and visitors by:\n"
        "- Answering FAQs about luv2play\n"
        "- Providing accurate product and activity information\n\n"
        "RULES:\n"
        "- Always be warm, friendly, and easy to understand\n"
        "- Answer ONLY from the provided luv2play knowledge base\n"
        "- Do NOT add outside information or personal opinions\n"
        "- Keep responses simple, clear, and child/parent friendly\n"
        "- Do NOT use technical jargon\n"
        "- If a question is about a specific product or activity, "
        "describe it clearly using only the provided material\n\n"
        "If the answer is NOT in the knowledge base, respond with:\n"
        "\"I'm sorry, I don't have that information right now. "
        "Please contact the luv2play support team for further help! 😊\""
)

        user_prompt = (
        f"luv2play Knowledge Base:\n{context}\n\n"
        f"Visitor Question: {question}\n\n"
        "Answer (friendly, professional, ONLY from knowledge base):\n"
        "If the meaning matches something in the knowledge base, "
        "rephrase it in simple, parent/child friendly language. "
        "Do NOT say 'not covered' if the answer can be reasonably derived from the material."
)

        full_prompt = system_prompt + "\n\n" + user_prompt

        try:
            response = self.llm.invoke(full_prompt)
            return response.content if hasattr(response, "content") else str(response)
        except Exception as e:
            return f"Error processing question: {str(e)}"