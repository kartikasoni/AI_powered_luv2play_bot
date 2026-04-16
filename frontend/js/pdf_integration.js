// PDF RAG Integration (Pre-loaded PDFs from data folder)

// ============================================
// AI Teacher - Main Integration
// Connects PDF selection with Voice Conversation
// ============================================

// class AITeacher {
//     constructor() {
//         this.backendURL = 'http://localhost:5001/api';
//         this.currentIndexName = null;
//         this.pdfs = [];
//         this.voiceConversation = null;
        
//         this.init();

//     }

//     async init() {
//         // Load available PDFs
//         await this.loadAvailablePDFs();
        
//         // Initialize voice conversation
//         this.setupVoiceConversation();
        
//         // Initialize text mode
//         this.setupTextMode();
//     }

//     async loadAvailablePDFs() {
//         // const select = document.getElementById('pdfSelect');
//         // const whiteboard = document.getElementById('whiteboard');

//         try {
//             const response = await fetch(`${this.backendURL}/pdfs`);
//             const data = await response.json();
//             // this.pdfs = data.pdfs || [];

//             // select.innerHTML = '';

//             if (!this.pdfs.length) {
//                 whiteboard.innerHTML = '<p style="color: #f44336;">⚠️ No PDFs found. Please add PDFs to the data folder.</p>';
//                 return;
//             }

//             select.innerHTML = '<option value="">-- Select a Material --</option>';

//             this.pdfs.forEach(pdf => {
//                 const option = document.createElement('option');
//                 option.value = pdf.index_name;
//                 option.textContent = pdf.display_name;
//                 select.appendChild(option);
//             });

//             // Handle selection
//             select.addEventListener('change', (e) => {
//                 this.currentIndexName = e.target.value;
                
//                 if (this.currentIndexName) {
//                     const selectedName = e.target.options[e.target.selectedIndex].text;
                    
//                 }
//             });


//             // Auto-select first PDF
//             if (select.options.length > 1) {
//                 select.selectedIndex = 1;
//                 select.dispatchEvent(new Event('change'));
//             }

//         } catch (error) {
//             console.error('Error loading PDFs:', error);
//             whiteboard.innerHTML = `
//                 <p style="color: #f44336;">
//                     ⚠️ Cannot connect to backend. 
//                     <br><br>
//                     Make sure Flask server is running on port 5001.
//                     <br><br>
//                     Run: <code>cd python_backend && python app.py</code>
//                 </p>
//             `;
//         }
//     }

//     setupTextMode() {
//         const askBtn = document.getElementById('askBtn');
//         const questionInput = document.getElementById('questionInput');

//         if (askBtn) {
//             askBtn.addEventListener('click', () => this.askTextQuestion());
//         }

//         if (questionInput) {
//             questionInput.addEventListener('keypress', (e) => {
//                 if (e.key === 'Enter') {
//                     this.askTextQuestion();
//                 }
//             });
//         }
//     }

//     async askTextQuestion() {
//         const questionInput = document.getElementById('questionInput');
//         const whiteboard = document.getElementById('whiteboard');
//         const question = questionInput.value.trim();

//         if (!question) {
//             alert('⚠️ Please type a question');
//             return;
//         }

//         if (!this.currentIndexName) {
//             alert('⚠️ Please select a PDF first');
//             return;
//         }

//         // Show loading
//         whiteboard.innerHTML = '<p style="color: #666;">🔍 Searching your material...</p>';

//         try {
//             const response = await fetch(`${this.backendURL}/ask`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     question: question,
//                     index_name: this.currentIndexName
//                 })
//             });

//             const data = await response.json();
//             console.log('Response:', data);

//             // Display answer
//             this.displayTextAnswer(data.answer, data.images || [], data.pages || []);

//             // Clear input
//             questionInput.value = '';

//         } catch (error) {
//             console.error('Error:', error);
//             whiteboard.innerHTML = `
//                 <p style="color: #f44336;">
//                     ❌ Error: ${error.message}
//                 </p>
//             `;
//         }
//     }

//     displayTextAnswer(answer, images, pages) {
//         const whiteboard = document.getElementById('whiteboard');
//         whiteboard.innerHTML = '';

//         // Answer box
//         const answerDiv = document.createElement('div');
//         answerDiv.className = 'answer-box';
//         answerDiv.innerHTML = `
//             <div class="answer-header">💬 Answer:</div>
//             <div class="answer-text">${answer}</div>
//         `;
//         whiteboard.appendChild(answerDiv);

//         // Images
//         if (images && images.length > 0) {
//             const imgSection = document.createElement('div');
//             imgSection.className = 'images-section';
//             imgSection.innerHTML = '<h3>📊 Related Images:</h3>';

//             images.forEach(img => {
//                 const imgDiv = document.createElement('div');
//                 imgDiv.className = 'image-container';
//                 imgDiv.innerHTML = `
//                     <p class="image-label">Page ${img.page}</p>
//                     <img src="http://localhost:5001${img.path}" alt="Page ${img.page}" onclick="window.open(this.src)" />
//                 `;
//                 imgSection.appendChild(imgDiv);
//             });

//             whiteboard.appendChild(imgSection);
//         }

//         // Pages
//         if (pages && pages.length > 0) {
//             const pagesInfo = document.createElement('p');
//             pagesInfo.className = 'pages-info';
//             pagesInfo.textContent = `📄 Found on pages: ${pages.join(', ')}`;
//             whiteboard.appendChild(pagesInfo);
//         }
//     }

//     setupVoiceConversation() {
//         // Create voice conversation instance
//         this.voiceConversation = new VoiceConversation(
//             this.backendURL,
//             () => this.currentIndexName // Function to get current PDF
//         );

//         // Wire up buttons
//         const startBtn = document.getElementById('startVoiceBtn');
//         const stopBtn = document.getElementById('stopVoiceBtn');

//         if (startBtn) {
//             startBtn.addEventListener('click', () => {
//                 this.voiceConversation.startConversation();
//             });
//         }

//         if (stopBtn) {
//             stopBtn.addEventListener('click', () => {
//                 this.voiceConversation.stopConversation();
//             });
//         }
//     }
// }

// // Initialize when page loads
// document.addEventListener('DOMContentLoaded', () => {
//     window.aiTeacher = new AITeacher();
//     console.log('✅ AI Teacher initialized with both text and voice modes');
// });






class AIbot {
    constructor() {
        this.backendURL = 'http://localhost:5001/api';
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

            questionInput.value = '';

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





