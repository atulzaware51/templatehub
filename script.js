// Utility Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
}

function closeModal() {
    const modal = document.getElementById('templateModal');
    modal.style.display = 'none';
}

// Mobile Menu Toggle
document.getElementById('mobileMenuBtn')?.addEventListener('click', function() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('templateModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Template Generators
const templates = {
    todo: generateTodoTemplate,
    health: generateHealthTemplate,
    medicine: generateMedicineTemplate,
    work: generateWorkTemplate,
    portfolio: generatePortfolioTemplate,
    gaming: generateGamingTemplate,
    logo: generateLogoTemplate
};

function openTemplate(templateName) {
    const modal = document.getElementById('templateModal');
    const modalBody = document.getElementById('modalBody');
    
    if (templates[templateName]) {
        modalBody.innerHTML = templates[templateName]();
        modal.style.display = 'block';
        initializeTemplateInteractions(templateName);
    }
}

// TO-DO TRACKER TEMPLATE
function generateTodoTemplate() {
    return `
        <div class="template-page">
            <div class="template-nav">
                <button class="active" onclick="switchTodoPage('dashboard')">Dashboard</button>
                <button onclick="switchTodoPage('priorities')">Priorities</button>
                <button onclick="switchTodoPage('completed')">Completed</button>
                <button onclick="switchTodoPage('stats')">Statistics</button>
            </div>
            
            <div id="todoContent" class="template-content">
                <!-- Dashboard Page -->
                <div id="todoDashboard">
                    <h2>Task Dashboard</h2>
                    <div class="input-group">
                        <label>New Task</label>
                        <input type="text" id="todoInput" placeholder="Enter task...">
                    </div>
                    <div class="input-group">
                        <label>Priority</label>
                        <select id="todoPriority">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Due Date</label>
                        <input type="date" id="todoDueDate">
                    </div>
                    <button class="btn btn-primary" onclick="addTodo()">Add Task</button>
                    
                    <div id="todoList" class="item-list" style="margin-top: 2rem;"></div>
                </div>
            </div>
        </div>
    `;
}

function switchTodoPage(page) {
    const content = document.getElementById('todoContent');
    const buttons = document.querySelectorAll('.template-nav button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    switch(page) {
        case 'dashboard':
            content.innerHTML = document.getElementById('todoDashboard').outerHTML;
            break;
        case 'priorities':
            content.innerHTML = `
                <h2>Priority Tasks</h2>
                <div class="stats-grid">
                    <div class="stat-card"><div class="stat-value">5</div><div class="stat-label">High Priority</div></div>
                    <div class="stat-card"><div class="stat-value">12</div><div class="stat-label">Medium Priority</div></div>
                    <div class="stat-card"><div class="stat-value">8</div><div class="stat-label">Low Priority</div></div>
                </div>
            `;
            break;
        case 'completed':
            content.innerHTML = `<h2>Completed Tasks</h2><p style="color: #64748b;">No completed tasks yet. Keep working!</p>`;
            break;
        case 'stats':
            content.innerHTML = `
                <h2>Statistics</h2>
                <div class="stats-grid">
                    <div class="stat-card"><div class="stat-value">25</div><div class="stat-label">Total Tasks</div></div>
                    <div class="stat-card"><div class="stat-value">18</div><div class="stat-label">Active</div></div>
                    <div class="stat-card"><div class="stat-value">7</div><div class="stat-label">Completed</div></div>
                    <div class="stat-card"><div class="stat-value">72%</div><div class="stat-label">Completion Rate</div></div>
                </div>
            `;
            break;
    }
}

let todos = [];
function addTodo() {
    const input = document.getElementById('todoInput');
    const priority = document.getElementById('todoPriority');
    const dueDate = document.getElementById('todoDueDate');
    
    if (input.value.trim()) {
        todos.push({
            id: Date.now(),
            text: input.value,
            priority: priority.value,
            dueDate: dueDate.value,
            completed: false
        });
        renderTodos();
        input.value = '';
    }
}

function renderTodos() {
    const list = document.getElementById('todoList');
    if (!list) return;
    
    list.innerHTML = todos.map(todo => `
        <div class="item-card">
            <div>
                <strong>${todo.text}</strong>
                <div style="font-size: 0.9rem; color: #64748b;">
                    Priority: ${todo.priority} | Due: ${todo.dueDate || 'No deadline'}
                </div>
            </div>
            <button class="btn btn-success" onclick="completeTodo(${todo.id})">Done</button>
        </div>
    `).join('');
}

function completeTodo(id) {
    todos = todos.filter(t => t.id !== id);
    renderTodos();
}

// HEALTH TRACKER TEMPLATE
function generateHealthTemplate() {
    return `
        <div class="template-page">
            <div class="template-nav">
                <button class="active" onclick="switchHealthPage('dashboard')">Dashboard</button>
                <button onclick="switchHealthPage('activity')">Activity Log</button>
                <button onclick="switchHealthPage('goals')">Goals</button>
                <button onclick="switchHealthPage('reports')">Reports</button>
            </div>
            
            <div id="healthContent" class="template-content">
                <h2>Health Dashboard</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">72</div>
                        <div class="stat-label">Heart Rate (bpm)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">120/80</div>
                        <div class="stat-label">Blood Pressure</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">7.5</div>
                        <div class="stat-label">Hours Sleep</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">8,543</div>
                        <div class="stat-label">Steps Today</div>
                    </div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h3>Log Vital Signs</h3>
                    <div class="input-group">
                        <label>Weight (kg)</label>
                        <input type="number" id="weightInput" placeholder="Enter weight">
                    </div>
                    <div class="input-group">
                        <label>Blood Pressure</label>
                        <input type="text" id="bpInput" placeholder="120/80">
                    </div>
                    <button class="btn btn-primary" onclick="logHealth()">Log Entry</button>
                </div>
            </div>
        </div>
    `;
}

function switchHealthPage(page) {
    const content = document.getElementById('healthContent');
    const buttons = document.querySelectorAll('.template-nav button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    switch(page) {
        case 'activity':
            content.innerHTML = `<h2>Activity Log</h2><p style="color: #64748b;">Track your daily activities and workouts</p>`;
            break;
        case 'goals':
            content.innerHTML = `<h2>Health Goals</h2><p style="color: #64748b;">Set and track your health objectives</p>`;
            break;
        case 'reports':
            content.innerHTML = `<h2>Health Reports</h2><p style="color: #64748b;">View your progress over time</p>`;
            break;
    }
}

function logHealth() {
    alert('Health data logged successfully!');
}

// MEDICINE TRACKER TEMPLATE
function generateMedicineTemplate() {
    return `
        <div class="template-page">
            <div class="template-nav">
                <button class="active" onclick="switchMedicinePage('list')">Medications</button>
                <button onclick="switchMedicinePage('schedule')">Schedule</button>
                <button onclick="switchMedicinePage('reminders')">Reminders</button>
                <button onclick="switchMedicinePage('history')">History</button>
            </div>
            
            <div id="medicineContent" class="template-content">
                <h2>Current Medications</h2>
                <div style="margin-bottom: 2rem;">
                    <div class="input-group">
                        <label>Medicine Name</label>
                        <input type="text" id="medicineInput" placeholder="Enter medicine name">
                    </div>
                    <div class="input-group">
                        <label>Dosage</label>
                        <input type="text" id="dosageInput" placeholder="e.g., 500mg">
                    </div>
                    <div class="input-group">
                        <label>Frequency</label>
                        <select id="frequencyInput">
                            <option>Once daily</option>
                            <option>Twice daily</option>
                            <option>Three times daily</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="addMedicine()">Add Medicine</button>
                </div>
                
                <div id="medicineList" class="item-list"></div>
            </div>
        </div>
    `;
}

function switchMedicinePage(page) {
    const content = document.getElementById('medicineContent');
    const buttons = document.querySelectorAll('.template-nav button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    switch(page) {
        case 'schedule':
            content.innerHTML = `<h2>Dosage Schedule</h2><p style="color: #64748b;">Your daily medication schedule</p>`;
            break;
        case 'reminders':
            content.innerHTML = `<h2>Medication Reminders</h2><p style="color: #64748b;">Set reminders for your medications</p>`;
            break;
        case 'history':
            content.innerHTML = `<h2>Prescription History</h2><p style="color: #64748b;">View past prescriptions and refills</p>`;
            break;
    }
}

let medicines = [];
function addMedicine() {
    const name = document.getElementById('medicineInput');
    const dosage = document.getElementById('dosageInput');
    const frequency = document.getElementById('frequencyInput');
    
    if (name.value.trim()) {
        medicines.push({
            id: Date.now(),
            name: name.value,
            dosage: dosage.value,
            frequency: frequency.value
        });
        renderMedicines();
        name.value = '';
        dosage.value = '';
    }
}

function renderMedicines() {
    const list = document.getElementById('medicineList');
    if (!list) return;
    
    list.innerHTML = medicines.map(med => `
        <div class="item-card">
            <div>
                <strong>${med.name}</strong>
                <div style="font-size: 0.9rem; color: #64748b;">
                    ${med.dosage} - ${med.frequency}
                </div>
            </div>
            <button class="btn btn-danger" onclick="removeMedicine(${med.id})">Remove</button>
        </div>
    `).join('');
}

function removeMedicine(id) {
    medicines = medicines.filter(m => m.id !== id);
    renderMedicines();
}

// WORK TRACKER TEMPLATE
function generateWorkTemplate() {
    return `
        <div class="template-page">
            <div class="template-nav">
                <button class="active" onclick="switchWorkPage('projects')">Projects</button>
                <button onclick="switchWorkPage('time')">Time Log</button>
                <button onclick="switchWorkPage('team')">Team</button>
                <button onclick="switchWorkPage('reports')">Reports</button>
            </div>
            
            <div id="workContent" class="template-content">
                <h2>Active Projects</h2>
                <div class="stats-grid">
                    <div class="stat-card"><div class="stat-value">8</div><div class="stat-label">Active Projects</div></div>
                    <div class="stat-card"><div class="stat-value">24</div><div class="stat-label">Tasks This Week</div></div>
                    <div class="stat-card"><div class="stat-value">42h</div><div class="stat-label">Hours Logged</div></div>
                    <div class="stat-card"><div class="stat-value">85%</div><div class="stat-label">Productivity</div></div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h3>Add New Project</h3>
                    <div class="input-group">
                        <label>Project Name</label>
                        <input type="text" id="projectInput" placeholder="Enter project name">
                    </div>
                    <div class="input-group">
                        <label>Deadline</label>
                        <input type="date" id="projectDeadline">
                    </div>
                    <button class="btn btn-primary" onclick="addProject()">Create Project</button>
                </div>
            </div>
        </div>
    `;
}

function switchWorkPage(page) {
    const content = document.getElementById('workContent');
    const buttons = document.querySelectorAll('.template-nav button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    switch(page) {
        case 'time':
            content.innerHTML = `<h2>Time Tracking</h2><p style="color: #64748b;">Log your work hours and breaks</p>`;
            break;
        case 'team':
            content.innerHTML = `<h2>Team Collaboration</h2><p style="color: #64748b;">Manage team tasks and communication</p>`;
            break;
        case 'reports':
            content.innerHTML = `<h2>Performance Reports</h2><p style="color: #64748b;">View your work analytics</p>`;
            break;
    }
}

function addProject() {
    alert('Project created successfully!');
}

// PORTFOLIO TEMPLATE
function generatePortfolioTemplate() {
    return `
        <div class="template-page">
            <div class="template-nav">
                <button class="active" onclick="switchPortfolioPage('home')">Home</button>
                <button onclick="switchPortfolioPage('projects')">Projects</button>
                <button onclick="switchPortfolioPage('about')">About</button>
                <button onclick="switchPortfolioPage('contact')">Contact</button>
            </div>
            
            <div id="portfolioContent" class="template-content">
                <div style="text-align: center; padding: 3rem 0;">
                    <h1 style="font-size: 3rem; margin-bottom: 1rem;">John Doe</h1>
                    <p style="font-size: 1.3rem; color: #64748b;">Creative Designer & Developer</p>
                    <button class="btn btn-primary" style="margin-top: 2rem;">View My Work</button>
                </div>
                
                <div style="margin-top: 3rem;">
                    <h2>Featured Projects</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div style="height: 150px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px; margin-bottom: 1rem;"></div>
                            <h3>Project Alpha</h3>
                            <p style="color: #64748b;">Web Application</p>
                        </div>
                        <div class="stat-card">
                            <div style="height: 150px; background: linear-gradient(135deg, #ec4899, #f59e0b); border-radius: 8px; margin-bottom: 1rem;"></div>
                            <h3>Project Beta</h3>
                            <p style="color: #64748b;">Mobile App</p>
                        </div>
                        <div class="stat-card">
                            <div style="height: 150px; background: linear-gradient(135deg, #10b981, #3b82f6); border-radius: 8px; margin-bottom: 1rem;"></div>
                            <h3>Project Gamma</h3>
                            <p style="color: #64748b;">Brand Design</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function switchPortfolioPage(page) {
    const content = document.getElementById('portfolioContent');
    const buttons = document.querySelectorAll('.template-nav button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    switch(page) {
        case 'projects':
            content.innerHTML = `<h2>All Projects</h2><p style="color: #64748b;">Browse through my portfolio of work</p>`;
            break;
        case 'about':
            content.innerHTML = `
                <h2>About Me</h2>
                <p>I'm a passionate designer and developer with 5+ years of experience creating beautiful and functional digital experiences.</p>
                <h3 style="margin-top: 2rem;">Skills</h3>
                <div class="stats-grid">
                    <div class="stat-card"><div class="stat-label">UI/UX Design</div></div>
                    <div class="stat-card"><div class="stat-label">Web Development</div></div>
                    <div class="stat-card"><div class="stat-label">Mobile Apps</div></div>
                    <div class="stat-card"><div class="stat-label">Brand Identity</div></div>
                </div>
            `;
            break;
        case 'contact':
            content.innerHTML = `
                <h2>Get In Touch</h2>
                <div class="input-group"><label>Name</label><input type="text" placeholder="Your name"></div>
                <div class="input-group"><label>Email</label><input type="email" placeholder="your@email.com"></div>
                <div class="input-group"><label>Message</label><textarea rows="5" placeholder="Your message..."></textarea></div>
                <button class="btn btn-primary">Send Message</button>
            `;
            break;
    }
}

// GAMING TEMPLATE
function generateGamingTemplate() {
    return `
        <div class="template-page">
            <div class="template-nav">
                <button class="active" onclick="switchGamingPage('hub')">Game Hub</button>
                <button onclick="switchGamingPage('leaderboard')">Leaderboard</button>
                <button onclick="switchGamingPage('community')">Community</button>
                <button onclick="switchGamingPage('news')">News</button>
            </div>
            
            <div id="gamingContent" class="template-content">
                <div style="text-align: center; padding: 2rem; background: linear-gradient(135deg, #6366f1, #ec4899); color: white; border-radius: 15px;">
                    <h1 style="font-size: 2.5rem;">Game Central</h1>
                    <p style="font-size: 1.2rem;">Your Ultimate Gaming Hub</p>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h2>Featured Games</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div style="height: 150px; background: #1a1a2e; border-radius: 8px; margin-bottom: 1rem;"></div>
                            <h3>Space Warriors</h3>
                            <button class="btn btn-primary">Play Now</button>
                        </div>
                        <div class="stat-card">
                            <div style="height: 150px; background: #16213e; border-radius: 8px; margin-bottom: 1rem;"></div>
                            <h3>Pixel Quest</h3>
                            <button class="btn btn-primary">Play Now</button>
                        </div>
                        <div class="stat-card">
                            <div style="height: 150px; background: #0f3460; border-radius: 8px; margin-bottom: 1rem;"></div>
                            <h3>Racing Legends</h3>
                            <button class="btn btn-primary">Play Now</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function switchGamingPage(page) {
    const content = document.getElementById('gamingContent');
    const buttons = document.querySelectorAll('.template-nav button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    switch(page) {
        case 'leaderboard':
            content.innerHTML = `
                <h2>Top Players</h2>
                <div class="item-list">
                    <div class="item-card"><div>🥇 Player1 - 15,420 pts</div></div>
                    <div class="item-card"><div>🥈 Player2 - 14,890 pts</div></div>
                    <div class="item-card"><div>🥉 Player3 - 13,650 pts</div></div>
                </div>
            `;
            break;
        case 'community':
            content.innerHTML = `<h2>Community Forum</h2><p style="color: #64748b;">Connect with fellow gamers</p>`;
            break;
        case 'news':
            content.innerHTML = `<h2>Latest Updates</h2><p style="color: #64748b;">Stay updated with gaming news</p>`;
            break;
    }
}

// LOGO CREATOR TEMPLATE
function generateLogoTemplate() {
    return `
        <div class="template-page">
            <div class="template-nav">
                <button class="active" onclick="switchLogoPage('canvas')">Canvas</button>
                <button onclick="switchLogoPage('elements')">Elements</button>
                <button onclick="switchLogoPage('colors')">Colors</button>
                <button onclick="switchLogoPage('export')">Export</button>
            </div>
            
            <div id="logoContent" class="template-content">
                <h2>Logo Design Canvas</h2>
                <div style="display: grid; grid-template-columns: 250px 1fr; gap: 2rem;">
                    <div>
                        <h3>Tools</h3>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <button class="btn btn-primary">Add Text</button>
                            <button class="btn btn-primary">Add Shape</button>
                            <button class="btn btn-primary">Add Icon</button>
                            <button class="btn btn-primary">Add Image</button>
                        </div>
                        
                        <h3 style="margin-top: 2rem;">Properties</h3>
                        <div class="input-group">
                            <label>Size</label>
                            <input type="range" min="10" max="100" value="50">
                        </div>
                        <div class="input-group">
                            <label>Color</label>
                            <input type="color" value="#6366f1">
                        </div>
                    </div>
                    
                    <div style="background: white; border: 2px solid #e2e8f0; border-radius: 15px; min-height: 500px; display: flex; align-items: center; justify-content: center;">
                        <div style="text-align: center;">
                            <div style="font-size: 4rem;">🎨</div>
                            <p style="color: #64748b; margin-top: 1rem;">Your logo canvas</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function switchLogoPage(page) {
    const content = document.getElementById('logoContent');
    const buttons = document.querySelectorAll('.template-nav button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    switch(page) {
        case 'elements':
            content.innerHTML = `
                <h2>Element Library</h2>
                <div class="stats-grid">
                    <div class="stat-card"><div style="font-size: 3rem;">⭐</div><div class="stat-label">Stars</div></div>
                    <div class="stat-card"><div style="font-size: 3rem;">●</div><div class="stat-label">Circles</div></div>
                    <div class="stat-card"><div style="font-size: 3rem;">■</div><div class="stat-label">Squares</div></div>
                    <div class="stat-card"><div style="font-size: 3rem;">▲</div><div class="stat-label">Triangles</div></div>
                    <div class="stat-card"><div style="font-size: 3rem;">❤</div><div class="stat-label">Hearts</div></div>
                    <div class="stat-card"><div style="font-size: 3rem;">✓</div><div class="stat-label">Checkmarks</div></div>
                </div>
            `;
            break;
        case 'colors':
            content.innerHTML = `
                <h2>Color Palette</h2>
                <div class="stats-grid">
                    <div class="stat-card" style="background: #6366f1; color: white;"><div class="stat-label">#6366f1</div></div>
                    <div class="stat-card" style="background: #8b5cf6; color: white;"><div class="stat-label">#8b5cf6</div></div>
                    <div class="stat-card" style="background: #ec4899; color: white;"><div class="stat-label">#ec4899</div></div>
                    <div class="stat-card" style="background: #10b981; color: white;"><div class="stat-label">#10b981</div></div>
                    <div class="stat-card" style="background: #f59e0b; color: white;"><div class="stat-label">#f59e0b</div></div>
                    <div class="stat-card" style="background: #3b82f6; color: white;"><div class="stat-label">#3b82f6</div></div>
                </div>
            `;
            break;
        case 'export':
            content.innerHTML = `
                <h2>Export Options</h2>
                <div class="input-group">
                    <label>Format</label>
                    <select>
                        <option>PNG</option>
                        <option>SVG</option>
                        <option>JPG</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Size</label>
                    <select>
                        <option>512x512</option>
                        <option>1024x1024</option>
                        <option>2048x2048</option>
                    </select>
                </div>
                <button class="btn btn-success">Download Logo</button>
            `;
            break;
    }
}

// Initialize template-specific interactions
function initializeTemplateInteractions(templateName) {
    if (templateName === 'todo') {
        renderTodos();
    } else if (templateName === 'medicine') {
        renderMedicines();
    }
}