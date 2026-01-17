/**
 * WhatsApp Floating Button Component
 * 
 * Lightweight floating button for WhatsApp contact.
 * - Fixed position bottom-left
 * - No JS dependencies, pure CSS
 * - Opens WhatsApp Web on desktop, app on mobile
 * - Accessible with aria-label
 */

const WHATSAPP_NUMBER = '31685406033';
const PREFILLED_MESSAGE = 'Hallo, ik heb een vraag over HETT Veranda\'s.';

const WhatsAppButton: React.FC = () => {
  // Encode message for URL
  const encodedMessage = encodeURIComponent(PREFILLED_MESSAGE);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat via WhatsApp"
      className="whatsapp-float"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        width: '56px',
        height: '56px',
        backgroundColor: '#25D366',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
        zIndex: 9999,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 211, 102, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)';
      }}
    >
      {/* WhatsApp SVG Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="32"
        height="32"
        fill="#ffffff"
        aria-hidden="true"
      >
        <path d="M16.002 2.667c-7.364 0-13.335 5.97-13.335 13.333 0 2.352.614 4.654 1.78 6.685l-1.87 6.838 7.004-1.838a13.29 13.29 0 0 0 6.421 1.648c7.364 0 13.335-5.97 13.335-13.333S23.366 2.667 16.002 2.667zm0 24.4a11.04 11.04 0 0 1-5.617-1.538l-.403-.24-4.177 1.096 1.114-4.073-.262-.418a10.96 10.96 0 0 1-1.685-5.894c0-6.087 4.953-11.04 11.03-11.04 6.087 0 11.04 4.953 11.04 11.04 0 6.087-4.963 11.067-11.04 11.067zm6.058-8.27c-.333-.166-1.967-.97-2.271-1.08-.304-.11-.525-.166-.746.166-.221.333-.858 1.08-1.052 1.301-.194.222-.388.25-.72.083-.333-.166-1.405-.518-2.676-1.65-.989-.881-1.656-1.97-1.85-2.303-.194-.333-.02-.513.145-.679.149-.149.333-.388.5-.583.166-.194.222-.333.333-.555.111-.222.056-.416-.028-.583-.083-.166-.746-1.798-1.022-2.463-.27-.647-.543-.56-.746-.57l-.636-.01c-.222 0-.583.083-.889.416s-1.166 1.138-1.166 2.776 1.194 3.221 1.36 3.443c.166.222 2.35 3.59 5.696 5.035.796.344 1.418.55 1.902.704.8.254 1.527.218 2.102.132.641-.095 1.967-.804 2.244-1.58.278-.776.278-1.442.194-1.58-.083-.139-.304-.222-.636-.389z"/>
      </svg>
    </a>
  );
};

export default WhatsAppButton;
