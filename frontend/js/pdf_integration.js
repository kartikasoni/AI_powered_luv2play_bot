// PDF RAG Integration (Pre-loaded PDFs from data folder)

// ============================================
// AI Teacher - Main Integration
// Connects PDF selection with Voice Conversation
// ============================================


class AIbot {
    constructor() {
        /*this.backendURL = 'http://localhost:5001/api';*/
        this.backendURL = 'https://kartika19-ai-powered-luv2play-bot.hf.space/api';
        this.currentIndexName = null;
        this.voiceConversation = null;
        
        this.init();
    }

    async init() {
        // Load default PDF automatically
        await this.loadDefaultPDF();
        
        // Setup text mode only
        this.setupTextMode();
    }

    // ✅ Automatically select first PDF (no dropdown)
    async loadDefaultPDF() {
        try {
            const response = await fetch(`${this.backendURL}/pdfs`);
            const data = await response.json();

            if (data.pdfs && data.pdfs.length > 0) {
                this.currentIndexName = data.pdfs[0].index_name;
                console.log("✅ Default PDF loaded:", this.currentIndexName);
            } else {
                alert("⚠️ No PDFs found in backend");
            }

        } catch (error) {
            console.error("Error loading PDFs:", error);
        }
    }

    // ✅ Text mode only
    setupTextMode() {
        const askBtn = document.getElementById('askBtn');
        const questionInput = document.getElementById('questionInput');

        if (askBtn) {
            askBtn.addEventListener('click', () => this.askTextQuestion());
        }

        if (questionInput) {
            questionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.askTextQuestion();
                }
            });
        }
    }

    async askTextQuestion() {
        const questionInput = document.getElementById('questionInput');
        const whiteboard = document.getElementById('whiteboard');
        const question = questionInput.value.trim();

        if (!question) {
            alert('⚠️ Please type a question');
            return;
        }

        if (!this.currentIndexName) {
            alert('⚠️ PDF not loaded');
            return;
        }

        whiteboard.innerHTML = '<p>🔍 Searching...</p>';

        try {
            const response = await fetch(`${this.backendURL}/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question,
                    index_name: this.currentIndexName
                })
            });

            const data = await response.json();

            this.displayTextAnswer(data.answer);

            // questionInput.value = '';

        } catch (error) {
            whiteboard.innerHTML = `<p style="color:red;">❌ ${error.message}</p>`;
        }
    }

    // ✅ Simplified answer display
    displayTextAnswer(answer) {
        const whiteboard = document.getElementById('whiteboard');

        whiteboard.innerHTML = `
            <div style="padding:15px; background:#f5f5f5; border-radius:10px;">
                <strong>💬 Answer:</strong>
                <p>${answer}</p>
            </div>
        `;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new AIbot();
});





