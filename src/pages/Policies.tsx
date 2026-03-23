import React from "react";
import { GlassCard, Button } from "../components/UI";
import { Shield, FileText, Scale, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export const Policies: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "📜 NEXORA PRIVACY POLICY",
      icon: Shield,
      content: `
        Nexora is a privacy-first communication platform designed to protect user data and ensure secure interactions.

        1. Information We Collect
        We collect only the minimum required information:
        - Username (unique identifier)
        - Email address (optional)
        - Public encryption key
        - Friend connections
        - Online status
        - Notification tokens

        We do NOT collect:
        - Messages or chat content
        - Photos, videos, or voice notes
        - Personal notes or private files

        2. Data Security
        All communication on Nexora is protected using advanced encryption technologies.
        Only the sender and receiver can access the content.
        Nexora does not have access to user conversations or shared media.

        3. Data Usage
        We use collected data only for:
        - Account authentication
        - Connecting users with friends
        - Delivering messages and notifications

        We do NOT:
        - Sell user data
        - Share personal data with third parties
        - Use data for advertising tracking

        4. User Privacy
        - Profiles are private by default
        - Only accepted connections can interact
        - No public visibility of user data

        5. Account Control
        Users have full control over their accounts.
        Accounts may be deleted permanently upon request or administrative action.

        6. Data Retention
        - Minimal account-related data is retained
        - Deleted accounts are permanently removed

        7. Children’s Privacy
        Nexora is not intended for users under the age of 13.

        8. Policy Updates
        We may update this policy from time to time. Users will be notified within the app.
      `,
    },
    {
      title: "📜 TERMS & CONDITIONS",
      icon: FileText,
      content: `
        By using Nexora, you agree to the following terms:

        1. Acceptance of Terms
        By accessing or using Nexora, you agree to comply with these Terms & Conditions.

        2. User Eligibility
        - You must be at least 13 years old
        - You are responsible for maintaining the security of your account

        3. Account Responsibility
        - Users must provide accurate information
        - You are responsible for all activity under your account

        4. Acceptable Use
        You agree NOT to:
        - Harass, abuse, or harm other users
        - Share illegal, harmful, or offensive content
        - Attempt to breach security or misuse the platform

        5. Friend-Based System
        - Communication is allowed only between accepted users
        - Unauthorized interaction attempts are restricted

        6. Content Responsibility
        Users are solely responsible for the content they share.
        Nexora does not monitor or control private communications.

        7. Account Suspension & Termination
        Nexora reserves the right to:
        - Suspend or terminate accounts violating policies
        - Remove content if required by law

        8. Service Availability
        We strive for uninterrupted service but do not guarantee:
        - Continuous availability
        - Error-free operation

        9. Changes to Terms
        We may update these terms at any time. Continued use means acceptance of updates.
      `,
    },
    {
      title: "⚖️ LEGAL DISCLAIMER",
      icon: Scale,
      content: `
        1. No Liability
        Nexora is provided “as is” without warranties of any kind.
        We are not responsible for:
        - User-generated content
        - Loss of data or communication
        - Misuse of the platform

        2. User Responsibility
        Users are solely responsible for:
        - Their interactions
        - Content shared
        - Account security

        3. Third-Party Services
        Nexora may integrate third-party services.
        We are not responsible for their content or policies.

        4. No Monitoring Guarantee
        Nexora does not actively monitor private communications.
        Users must report any violations.

        5. Limitation of Liability
        Nexora shall not be liable for:
        - Indirect or incidental damages
        - Data loss or service interruptions

        6. Legal Compliance
        Users agree to use Nexora in compliance with all applicable laws and regulations.
      `,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center gap-4">
          <Button variant="glass" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Policies & Terms</h1>
        </header>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="space-y-4">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <section.icon size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                </div>
                <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <footer className="text-center py-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Nexora respects your privacy. We do not store or access your personal conversations. Use responsibly. Terms apply.
          </p>
        </footer>
      </div>
    </div>
  );
};
