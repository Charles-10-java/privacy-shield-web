const app = document.getElementById('app');
const bottomNav = document.getElementById('bottom-nav');

let currentTab = 'protect';
let isProtecting = true;
let isFaceDetected = false;

// Mock user state
const user = {
    name: 'Charlz',
    plan: 'Pro Plan Active',
};

// --- View Definitions ---

const views = {
    splash: () => `
        <div class="screen flex-center flex-column" style="background: var(--bg-dark); height: 100vh;">
            <ion-icon name="eye-off-outline" class="icon-large" style="font-size: 80px;"></ion-icon>
            <h1 style="font-size: 32px; letter-spacing: 2px;">PrivacyShield</h1>
            <p style="margin-top: 20px; font-weight: 500; letter-spacing: 1px;">Securing your vision.</p>
        </div>
    `,

    onboarding: () => `
        <div class="screen" style="display: flex; flex-direction: column;">
            <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                <div class="text-center">
                    <ion-icon name="scan-outline" class="icon-large" style="font-size: 100px;"></ion-icon>
                    <h2 class="mt-20">Stop Shoulder Surfers</h2>
                    <p>Advanced real-time AI detects unauthorized eyes and automatically protects your screen.</p>
                </div>
            </div>
            <div class="onboarding-dots">
                <span class="dot active"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
            <button class="btn-primary" onclick="navigateTo('login')">Get Started</button>
        </div>
    `,

    login: () => `
        <div class="screen">
            <h1 class="mt-40">Welcome Back</h1>
            <p>Sign in to manage your privacy settings and hardware.</p>
            
            <div class="glass-panel mt-40">
                <div class="input-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="name@example.com">
                </div>
                <div class="input-group">
                    <label>Password</label>
                    <input type="password" placeholder="••••••••">
                </div>
                <button class="btn-primary mt-20" onclick="navigateTo('setup')">Log In</button>
                <div class="text-center mt-20">
                    <p style="color: var(--accent-primary); cursor: pointer;">Forgot Password?</p>
                </div>
            </div>
            
            <div class="text-center mt-40">
                <p>New here? <span style="color: var(--accent-primary); font-weight: 600;">Create an account</span></p>
            </div>
        </div>
    `,

    setup: () => `
        <div class="screen flex-center flex-column text-center">
            <ion-icon name="bluetooth-outline" class="icon-large" style="font-size: 80px; color: var(--accent-secondary);"></ion-icon>
            <h2>Pairing Controller</h2>
            <p>Scanning for nearby PrivacyShield BLE devices...</p>
            
            <div class="spinner mt-40"></div>
            
            <button class="btn-primary mt-40" onclick="completeSetup()">Simulate Pair Success</button>
        </div>
    `,

    // --- MAIN TABS ---
    
    protect: () => `
        <div class="screen">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Dashboard</h2>
                <div class="${isProtecting ? 'live-badge' : 'hidden'}">
                    <div class="dot"></div>
                    <span style="font-size: 12px; font-weight: bold;">LIVE</span>
                </div>
            </div>

            <!-- AI Camera Emulator -->
            <div class="camera-preview">
                <div class="camera-overlay">
                    <div style="align-self: flex-end;">
                        <button style="background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color:white; padding: 6px 12px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 12px; font-family: 'Outfit';" onclick="toggleFaceDetection()">
                            <ion-icon name="person-add-outline"></ion-icon> Simulate Surfer
                        </button>
                    </div>
                </div>
                
                ${isFaceDetected ? `
                    <div class="detected-box" style="top: 20%; left: 40%; width: 120px; height: 120px;">
                        <span class="detected-label">Threat Detected</span>
                    </div>
                    <div class="detected-box" style="top: 25%; left: 70%; width: 80px; height: 80px; border-color: yellow; animation: none;">
                        <span class="detected-label" style="background: #FFB300;">Authorized</span>
                    </div>
                ` : ''}
            </div>

            <!-- Status Panel -->
            <div class="glass-panel mt-20">
                 <div style="display: flex; align-items: center; gap: 15px;">
                    <ion-icon name="shield-checkmark" style="font-size: 36px; color: ${isProtecting ? 'var(--success)' : 'var(--text-muted)'};"></ion-icon>
                    <div style="flex:1;">
                        <h3 style="margin-bottom: 4px;">${isProtecting ? 'Protection Active' : 'Protection Disabled'}</h3>
                        <p style="font-size: 13px;">${isFaceDetected ? 'Activating louvers to block view.' : 'System monitoring for unauthorized views.'}</p>
                    </div>
                    <!-- Manual Override Toggle -->
                    <div class="toggle-switch ${isProtecting ? 'active' : ''}" onclick="toggleProtection()">
                        <div class="toggle-knob"></div>
                    </div>
                 </div>
            </div>
            
            <h3>Quick Actions</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                <button class="btn-secondary" style="font-size: 14px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <ion-icon name="options-outline" style="font-size: 24px;"></ion-icon>
                    Privacy Zones
                </button>
                <button class="btn-secondary" style="font-size: 14px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <ion-icon name="calendar-outline" style="font-size: 24px;"></ion-icon>
                    Schedules
                </button>
            </div>
        </div>
    `,

    activity: () => `
        <div class="screen">
            <h2>Activity Feed</h2>
            <div class="glass-panel" style="padding: 10px 20px;">
                
                <div class="event-item">
                    <div class="event-icon danger">
                        <ion-icon name="warning-outline"></ion-icon>
                    </div>
                    <div class="event-details" style="flex:1;">
                        <div class="event-title">Surfer Detected</div>
                        <div class="event-time">Today, 2:45 PM • Louvers Deployed</div>
                    </div>
                    <ion-icon name="chevron-forward-outline" style="color: var(--text-muted);"></ion-icon>
                </div>
                
                <div class="event-item">
                    <div class="event-icon info">
                        <ion-icon name="hardware-chip-outline"></ion-icon>
                    </div>
                    <div class="event-details" style="flex:1;">
                        <div class="event-title">Firmware Updated</div>
                        <div class="event-time">Yesterday, 10:20 AM • v1.4.2</div>
                    </div>
                </div>

                <div class="event-item" style="border: none;">
                    <div class="event-icon danger">
                        <ion-icon name="warning-outline"></ion-icon>
                    </div>
                    <div class="event-details" style="flex:1;">
                        <div class="event-title">Surfer Detected</div>
                        <div class="event-time">Mon, 8:15 AM • Louvers Deployed</div>
                    </div>
                </div>

            </div>
            <button class="btn-secondary mt-20">Export Incident Report</button>
        </div>
    `,

    device: () => `
        <div class="screen">
            <h2>My Devices</h2>
            
            <div class="glass-panel" style="position: relative; overflow: hidden;">
                <!-- Decorative glow background -->
                <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: var(--accent-primary); filter: blur(60px); opacity: 0.5;"></div>
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h3>Privacy Controller Pro</h3>
                        <p style="color: var(--success); font-weight: 600; font-size: 12px; margin-top: 4px;">● Connected via BLE</p>
                    </div>
                    <ion-icon name="battery-full-outline" style="font-size: 24px; color: var(--success);"></ion-icon>
                </div>
                
                <div style="margin-top: 25px;">
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
                        <span>Louver Calibration</span>
                        <span>85% tuned</span>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                        <div style="height: 100%; width: 85%; background: var(--accent-primary);"></div>
                    </div>
                </div>
            </div>
            
            <div class="glass-panel">
                <div class="toggle-row" style="border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                    <div>
                        <h4 style="font-size: 15px;">Hardware Setup Wizard</h4>
                        <p style="font-size: 12px;">Re-run device calibration</p>
                    </div>
                    <ion-icon name="arrow-forward-circle-outline" style="font-size: 24px; color: var(--accent-primary);"></ion-icon>
                </div>
                <div class="toggle-row" style="padding-top: 16px;">
                    <div>
                        <h4 style="font-size: 15px;">Check for Updates</h4>
                        <p style="font-size: 12px;">Firmware Version 1.4.2</p>
                    </div>
                    <ion-icon name="cloud-download-outline" style="font-size: 24px;"></ion-icon>
                </div>
            </div>

            <button class="btn-secondary" style="border-color: rgba(255,61,0,0.3); color: var(--danger);">Remove Device</button>
        </div>
    `,

    settings: () => `
        <div class="screen">
            <h2>Settings</h2>
            
            <h3>Detection</h3>
            <div class="glass-panel">
                 <div class="toggle-row">
                    <div>
                        <h4 style="font-size: 15px;">Face Blur Policy</h4>
                        <p style="font-size: 12px; max-width: 80%;">Blur unrecognized faces before logging to activity feed.</p>
                    </div>
                    <div class="toggle-switch active" onclick="this.classList.toggle('active')"><div class="toggle-knob"></div></div>
                 </div>
                 <div style="margin-top: 20px;">
                    <h4 style="font-size: 15px; margin-bottom: 10px;">Sensitivity</h4>
                    <p style="font-size: 12px; margin-bottom: 10px;">Adjust AI detection aggression to reduce false positives.</p>
                    <input type="range" min="1" max="100" value="80">
                 </div>
            </div>

            <h3>Preferences</h3>
            <div class="glass-panel">
                <div class="toggle-row" style="border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                    <span>Dark Mode</span>
                    <div class="toggle-switch active" onclick="this.classList.toggle('active')"><div class="toggle-knob"></div></div>
                </div>
                <div class="toggle-row" style="padding-top: 16px;">
                    <span>Push Notifications</span>
                    <div class="toggle-switch active" onclick="this.classList.toggle('active')"><div class="toggle-knob"></div></div>
                </div>
            </div>
        </div>
    `,

    profile: () => `
        <div class="screen">
            <div class="text-center mt-20 mb-20 style="margin-bottom: 30px;"">
                <div class="profile-avatar"><ion-icon name="person"></ion-icon></div>
                <h2 class="mt-20" style="margin-bottom: 4px;">${user.name}</h2>
                <span style="background: linear-gradient(90deg, #FFDF00, #DAA520); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 14px;">★ ${user.plan}</span>
            </div>

            <div class="glass-panel mt-40">
                <h3 style="margin-bottom: 16px; font-size: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">Account Security</h3>
                <div class="toggle-row">
                    <span style="font-size: 14px;">Two-Factor Authentication</span>
                    <span style="color: var(--success); font-size: 12px; font-weight: bold;">ENABLED</span>
                </div>
                <div class="toggle-row" style="margin-top: 10px;">
                    <span style="font-size: 14px;">Change Password</span>
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                </div>
            </div>

            <div class="glass-panel">
                <div class="toggle-row" style="padding: 5px 0;">
                    <span style="font-size: 14px;">Help & Support</span>
                    <ion-icon name="chatbubbles-outline"></ion-icon>
                </div>
                <div class="toggle-row" style="padding: 5px 0; margin-top: 10px;">
                    <span style="font-size: 14px;">Licenses & Legal</span>
                    <ion-icon name="document-text-outline"></ion-icon>
                </div>
            </div>

            <button class="btn-secondary" style="border: none; color: var(--danger); background: transparent; box-shadow: none;" onclick="navigateTo('login')">Log Out</button>
        </div>
    `
};

// --- Navigation Logic ---

function navigateTo(screenName) {
    if (views[screenName]) {
        app.innerHTML = views[screenName]();
        
        // Hide nav on auth/setup flows
        if (['splash', 'onboarding', 'login', 'setup'].includes(screenName)) {
            bottomNav.classList.add('hidden');
        } else {
            bottomNav.classList.remove('hidden');
        }
    }
}

function navigateTab(tabName) {
    // Update active state on nav icons
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    currentTab = tabName;
    navigateTo(tabName);
}

// --- Interaction Handlers ---

function completeSetup() {
    navigateTo('protect');
}

function toggleProtection() {
    isProtecting = !isProtecting;
    navigateTo('protect'); // re-render layout
}

function toggleFaceDetection() {
    isFaceDetected = !isFaceDetected;
    
    // Simulate smart activation of lourvers
    if(isFaceDetected) {
        // If system detects face, it forcefully protects and flags ui
        console.log("BLE Sent: LOUVER_DEPLOY");
    } else {
        console.log("BLE Sent: LOUVER_RETRACT");
    }
    
    navigateTo('protect'); // re-render layout
}

// Global scope functions for onclick DOM bindings
window.navigateTo = navigateTo;
window.navigateTab = navigateTab;
window.completeSetup = completeSetup;
window.toggleProtection = toggleProtection;
window.toggleFaceDetection = toggleFaceDetection;

// --- App Initialization ---

// Start with Splash Screen
navigateTo('splash');

// Simulate timer to move from Splash to Onboarding
setTimeout(() => {
    navigateTo('onboarding');
}, 2500);
