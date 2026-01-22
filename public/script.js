const API_BASE_URL = '';

// DOM Elements
const emailToInput = document.getElementById('emailTo');
const emailSubjectInput = document.getElementById('emailSubject');
const emailMessageInput = document.getElementById('emailMessage');
const templateSelect = document.getElementById('templateSelect');
const sendBtn = document.getElementById('sendBtn');
const statusMessage = document.getElementById('statusMessage');
const emailPreview = document.getElementById('emailPreview');
const activityLog = document.getElementById('activityLog');

// Templates data
const templates = {
    welcome: {
        subject: "Welcome to Our Service!",
        message: "Hello,\n\nWelcome to our platform! We're excited to have you on board.\n\nHere are your login details:\nEmail: {{email}}\n\nBest regards,\nThe Team"
    },
    notification: {
        subject: "Important Update",
        message: "Dear User,\n\nThis is an important notification regarding your account.\n\nPlease review the following information:\n- Item 1\n- Item 2\n- Item 3\n\nRegards,\nAdmin Team"
    }
};

// Load template
function loadTemplate() {
    const template = templateSelect.value;
    
    if (template === 'custom') {
        emailSubjectInput.value = '';
        emailMessageInput.value = '';
        return;
    }
    
    if (templates[template]) {
        emailSubjectInput.value = templates[template].subject;
        emailMessageInput.value = templates[template].message.replace('{{email}}', emailToInput.value || 'user@example.com');
        updatePreview();
    }
}

// Update preview
function updatePreview() {
    const subject = emailSubjectInput.value || 'No subject';
    const message = emailMessageInput.value || 'No message';
    
    emailPreview.innerHTML = `
        <div style="padding: 15px; background: white; border-radius: 8px;">
            <h3 style="color: #333; margin-bottom: 10px;">${subject}</h3>
            <div style="color: #666; white-space: pre-wrap; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
            <div style="font-size: 12px; color: #999;">
                <p>To: ${emailToInput.value || 'Not specified'}</p>
                <p>Preview generated: ${new Date().toLocaleString()}</p>
            </div>
        </div>
    `;
}

// Preview email
function previewEmail() {
    if (!emailToInput.value) {
        showStatus('Please enter recipient email', 'error');
        return;
    }
    updatePreview();
}

// Send email
async function sendEmail() {
    // Validate inputs
    if (!emailToInput.value || !emailSubjectInput.value || !emailMessageInput.value) {
        showStatus('Please fill in all fields', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToInput.value)) {
        showStatus('Please enter a valid email address', 'error');
        return;
    }

    // Disable button and show loading
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    sendBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: emailToInput.value,
                subject: emailSubjectInput.value,
                message: emailMessageInput.value,
                fromName: 'Auto Mailing System'
            })
        });

        const data = await response.json();

        if (data.success) {
            showStatus('Email sent successfully!', 'success');
            
            // Add to activity log
            addToActivityLog({
                to: emailToInput.value,
                subject: emailSubjectInput.value,
                time: new Date().toLocaleTimeString(),
                status: 'Sent'
            });
            
            // Clear form after successful send
            setTimeout(clearForm, 2000);
        } else {
            showStatus(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('Failed to send email. Check console for details.', 'error');
    } finally {
        // Reset button
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Email';
        sendBtn.disabled = false;
    }
}

// Show status message
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 5000);
}

// Add to activity log
function addToActivityLog(activity) {
    const li = document.createElement('li');
    li.innerHTML = `
        <strong>To:</strong> ${activity.to}<br>
        <strong>Subject:</strong> ${activity.subject}<br>
        <strong>Time:</strong> ${activity.time} | 
        <strong>Status:</strong> <span style="color: #4CAF50;">${activity.status}</span>
    `;
    activityLog.prepend(li);
    
    // Keep only last 5 activities
    if (activityLog.children.length > 5) {
        activityLog.removeChild(activityLog.lastChild);
    }
}

// Clear form
function clearForm() {
    emailToInput.value = '';
    emailSubjectInput.value = '';
    emailMessageInput.value = '';
    templateSelect.value = '';
    emailPreview.innerHTML = '<p>Your email preview will appear here...</p>';
    statusMessage.style.display = 'none';
}

// Initialize event listeners
emailToInput.addEventListener('input', updatePreview);
emailSubjectInput.addEventListener('input', updatePreview);
emailMessageInput.addEventListener('input', updatePreview);

// Load templates from server on startup
async function loadTemplatesFromServer() {
    try {
        const response = await fetch(`${API_BASE_URL}/templates`);
        const serverTemplates = await response.json();
        
        // Update local templates with server templates
        Object.assign(templates, serverTemplates);
    } catch (error) {
        console.log('Using local templates');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTemplatesFromServer();
    console.log('Auto Mailing System initialized');

});

