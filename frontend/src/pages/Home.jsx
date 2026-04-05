import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles.css";

function Home() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    // Navigate to login with role state or query parameter
    navigate("/login", { state: { role } });
  };

  return (
    <div className="landing-page">
      {/* 1. Navbar (Fixed Top) */}
      <nav className="landing-nav">
        <div className="landing-brand">
          <div className="brand-badge">MC</div>
          <span className="brand-text">MediConnect</span>
        </div>
        <div className="landing-links">
          <a href="#features">Features</a>
          <a href="#for-doctors">For Doctors</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#reviews">Reviews</a>
        </div>
        <div className="landing-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/login" className="btn" style={{ color: "var(--text)", background: "transparent" }}>Sign In</Link>
          <Link to="/signup" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Healthcare, wherever you are</h1>
          <p className="hero-subtitle">
            Connect with top doctors, manage your prescriptions, and access your medical records instantly through our secure platform.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary hero-btn">Book a Consultation</Link>
            <a href="#how-it-works" className="btn btn-light hero-btn">See How It Works</a>
          </div>
          <div className="trust-stats">
            <div className="stat"><strong>5,000+</strong> Doctors</div>
            <div className="stat"><strong>1M+</strong> Consultations</div>
            <div className="stat"><strong>4.9/5</strong> Rating</div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card">
            <div className="visual-header">Live Consultation</div>
            <div className="visual-body">Dr. Sarah Jenkins - Available Now</div>
            <div className="visual-footer">Connect securely in 2 mins</div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Everything you need for modern care</h2>
        <div className="features-grid">
          {[
            { title: "Video Consultations", desc: "High-quality, secure video calls with your doctors.", icon: "📹" },
            { title: "E-Prescriptions", desc: "Instant digital prescriptions sent directly to pharmacies.", icon: "💊" },
            { title: "Medical Records", desc: "Centralized and secure access to your comprehensive health history.", icon: "📁" },
            { title: "Smart Scheduling", desc: "Book appointments effortlessly with automated reminders.", icon: "📅" },
            { title: "HIPAA Compliant", desc: "Bank-level encryption keeping your personal health data safe.", icon: "🔒" },
            { title: "Real-time Notifications", desc: "Get updates on appointments, test results, and prescriptions.", icon: "🔔" }
          ].map((feature, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Who It's For (Roles Section) */}
      <section id="for-doctors" className="roles-section">
        <h2 className="section-title">Built for everyone in healthcare</h2>
        <div className="roles-grid">
          {[
            { role: "patient", title: "Patients", items: ["Book appointments", "Video consults", "View medical records", "Get e-prescriptions"] },
            { role: "doctor", title: "Doctors", items: ["Manage schedule", "Conduct telehealth", "Write prescriptions", "Update health records"] },
            { role: "pharmacist", title: "Pharmacists", items: ["Receive e-prescriptions", "Verify patient identity", "Update inventory", "Track fulfillments"] },
            { role: "admin", title: "Administrators", items: ["Manage users", "Oversee platform", "System analytics", "Security compliance"] }
          ].map((r, i) => (
            <div key={i} className="role-card" onClick={() => handleRoleSelect(r.role)}>
              <h3>{r.title}</h3>
              <ul>
                {r.items.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
              <span className="role-link">Login as {r.title.slice(0, -1)} &rarr;</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. How It Works */}
      <section id="how-it-works" className="how-it-works-section">
        <h2 className="section-title">Simple 4-Step Journey</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Create Account</h4>
            <p>Sign up securely in minutes.</p>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Find a Doctor</h4>
            <p>Browse by specialty and availability.</p>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Book & Consult</h4>
            <p>Schedule and join your video call.</p>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-number">4</div>
            <h4>Get Prescription</h4>
            <p>Receive meds digitally right after.</p>
          </div>
        </div>
      </section>

      {/* 6. Testimonials / Social Proof */}
      <section id="reviews" className="testimonials-section">
        <h2 className="section-title">Trusted by thousands</h2>
        <div className="testimonials-grid">
          {[
            { quote: "MediConnect changed how I manage my chronic condition. So easy!", name: "Emily R.", role: "Patient", city: "New York", stars: "★★★★★" },
            { quote: "The smart scheduling and e-prescriptions save me hours every week.", name: "Dr. James L.", role: "Doctor", city: "Chicago", stars: "★★★★★" },
            { quote: "Seamless prescription fulfillment process. Very secure.", name: "Sarah M.", role: "Pharmacist", city: "Austin", stars: "★★★★★" }
          ].map((t, i) => (
             <div key={i} className="testimonial-card">
               <div className="stars">{t.stars}</div>
               <p className="quote">"{t.quote}"</p>
               <div className="reviewer">
                 <strong>{t.name}</strong> • {t.role}
                 <br/><small>{t.city}</small>
               </div>
             </div>
          ))}
        </div>
      </section>

      {/* 7. CTA Banner */}
      <section className="cta-banner">
        <h2>Ready to transform your healthcare experience?</h2>
        <p>Join MediConnect today and get access to top-tier medical services anytime, anywhere.</p>
        <div className="cta-buttons">
          <Link to="/signup" className="btn btn-light hero-btn" style={{ color: 'var(--brand-dark)' }}>Register Now</Link>
          <Link to="/login" className="btn ghost-link" style={{ border: '1px solid white' }}>Sign In</Link>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand-badge" style={{ transform: "scale(0.8)" }}>MC</div>
            <span style={{ fontWeight: 600 }}>MediConnect</span>
          </div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} MediConnect. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;
