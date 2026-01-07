import React from "react";
import { BOOKING_URL } from "../config/booking";
import { MapPin, Clock } from "lucide-react";

const GOOGLE_MAPS_IFRAME = "https://www.google.com/maps?q=Hoppenkuil+17,+5626DD+Eindhoven&output=embed";

const ShowroomAppointment: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="text-xs font-bold text-hett-secondary tracking-widest uppercase mb-2 block">SHOWROOM HETT EINDHOVEN</span>
          <h1 className="text-3xl md:text-4xl font-black text-hett-dark mb-3">Plan hier je afspraak met onze adviseur(s)</h1>
          <div className="flex justify-center gap-6 text-sm text-gray-500 font-bold mb-2">
            <span className="flex items-center gap-2"><Clock size={16} className="text-hett-secondary" />1 uur</span>
            <span className="flex items-center gap-2"><MapPin size={16} className="text-hett-secondary" />Showroom Eindhoven</span>
          </div>
        </div>

        {/* Booking Widget Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-0 mb-8">
          <iframe
            src={BOOKING_URL}
            title="Afspraak plannen"
            className="w-full min-h-[700px] md:min-h-[700px] sm:min-h-[600px] rounded-2xl border-none"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allow="fullscreen"
          />
          <div className="text-center py-4">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline font-bold text-sm"
            >
              Lukt het niet? Open de planner in een nieuw tabblad.
            </a>
          </div>
        </div>

        {/* Google Maps Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-0 mb-8">
          <iframe
            src={GOOGLE_MAPS_IFRAME}
            title="Showroom locatie Hoppenkuil 17, Eindhoven"
            className="w-full h-[360px] rounded-2xl border-none"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allow="fullscreen"
          />
        </div>
      </div>
    </div>
  );
};

export default ShowroomAppointment;
