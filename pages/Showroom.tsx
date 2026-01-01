
import React, { useState } from 'react';
import { Clock, MapPin, ChevronLeft, ChevronRight, Globe, Calendar as CalendarIcon, Phone, Mail, Check, X, Send, CheckCircle, User } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';

const Showroom: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        comments: ''
    });

    // Mock Calendar Data
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const weekDays = ['MA.', 'DI.', 'WO.', 'DO.', 'VR.', 'ZA.', 'ZO.'];
    const timeSlots = ['09:30', '10:00', '11:00', '13:00', '14:30', '16:00'];

    // Simulating available dates (e.g., specific weekdays are open)
    const availableDates = [2, 3, 4, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 27, 28, 29, 30, 31];

    const handleDateSelect = (day: number) => {
        if (availableDates.includes(day)) {
            setSelectedDate(day);
            setSelectedTime(null);
        }
    };

    const handleConfirmClick = () => {
        if (selectedDate && selectedTime) {
            setIsFormOpen(true);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setIsSubmitted(true);
        }, 500);
    };

    const handleClose = () => {
        setIsFormOpen(false);
        setTimeout(() => {
            setIsSubmitted(false);
            setForm({ firstName: '', lastName: '', email: '', phone: '', comments: '' });
        }, 300);
    };

    return (
        <div className="min-h-screen bg-white font-sans">

            {/* Header */}
            <PageHeader
                title="Bezoek onze Showroom"
                subtitle="Afspraak maken"
                description="Ervaar onze producten in het echt. Onze adviseurs staan klaar met koffie en deskundig advies."
                image="/assets/images/showroom_advice.png"
            />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: Booking Module */}
                    <div className="lg:col-span-7 bg-white border border-gray-200 rounded-[24px] shadow-sm overflow-hidden relative z-10">

                        {/* Module Header */}
                        <div className="p-8 md:p-10 border-b border-gray-100 text-center">
                            <img src="/logo.png" alt="HETT" className="h-12 mx-auto mb-6 object-contain" />
                            <span className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-2 block">Showroom HETT Eindhoven</span>
                            <h2 className="text-2xl md:text-3xl font-black text-hett-dark mb-4">
                                Plan hier je afspraak met onze adviseur(s)
                            </h2>

                            <div className="flex justify-center gap-6 text-gray-500 text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <Clock size={18} />
                                    <span>1 uur</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} />
                                    <span>Showroom Eindhoven</span>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Section */}
                        <div className="p-8 md:p-10">
                            <h3 className="text-xl font-bold text-hett-dark mb-8 text-center">Kies een datum en tijd</h3>

                            <div className="flex flex-col md:flex-row gap-12">
                                {/* Calendar */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-6">
                                        <button className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} className="text-hett-dark" /></button>
                                        <span className="font-bold text-hett-dark text-lg">Mei 2024</span>
                                        <button className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20} className="text-hett-dark" /></button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-y-4 mb-2">
                                        {weekDays.map(d => (
                                            <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-2">
                                        {/* Empty slots for start of month */}
                                        <div className="aspect-square"></div>
                                        <div className="aspect-square"></div>

                                        {days.map(day => {
                                            const isAvailable = availableDates.includes(day);
                                            const isSelected = selectedDate === day;

                                            return (
                                                <button
                                                    key={day}
                                                    disabled={!isAvailable}
                                                    onClick={() => handleDateSelect(day)}
                                                    className={`aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all relative ${isSelected
                                                        ? 'bg-hett-dark text-white font-bold shadow-lg scale-105'
                                                        : isAvailable
                                                            ? 'text-gray-700 hover:bg-gray-100'
                                                            : 'text-gray-300 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {day}
                                                    {/* Indicator for availability if not selected */}
                                                    {isAvailable && !isSelected && (
                                                        <span className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full"></span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <Globe size={16} />
                                            <span>Tijdzone: Midden-Europese tijd</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Time Slots (Visible when date selected) */}
                                <div className="w-full md:w-48">
                                    {selectedDate ? (
                                        <div className="space-y-3 animate-in slide-in-from-left-4 fade-in duration-300">
                                            <div className="text-center text-sm font-bold text-gray-400 mb-2">Beschikbaar op {selectedDate} Mei</div>
                                            {timeSlots.map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`w-full py-3 rounded-lg border text-sm font-bold transition-all ${selectedTime === time
                                                        ? 'border-hett-brown bg-hett-brown text-white shadow-md transform scale-105'
                                                        : 'border-hett-dark text-hett-dark hover:bg-hett-dark hover:text-white'
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-center p-4 border-2 border-dashed border-gray-100 rounded-xl">
                                            <p className="text-sm text-gray-400">Selecteer eerst een datum om beschikbare tijden te zien.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Confirmation Button */}
                        <div className={`p-8 bg-gray-50 border-t border-gray-100 text-center transition-all duration-300 ${selectedDate && selectedTime ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none'}`}>
                            <button
                                onClick={handleConfirmClick}
                                className="bg-hett-dark text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-hett-brown transition-colors shadow-lg w-full md:w-auto flex items-center justify-center gap-2"
                            >
                                Afspraak bevestigen <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Info Sidebar */}
                    <div className="lg:col-span-5 bg-[#fcfbf7] rounded-[24px] p-8 md:p-10 space-y-8 h-full">

                        <div>
                            <h3 className="text-2xl font-black text-hett-dark mb-6">Openingstijden &<br />contactgegevens</h3>

                            <div className="space-y-4 text-sm text-gray-600 leading-relaxed mb-8">
                                <p>
                                    <strong className="block text-gray-900 text-base">HETT B.V.</strong>
                                    Industrieweg 45<br />
                                    5600 AA Eindhoven
                                </p>
                                <p>
                                    <span className="block">KVK: 832023291</span>
                                    <span className="block">BTW: NL866121171B01</span>
                                </p>
                                <p>
                                    <a href="mailto:info@hett.nl" className="flex items-center gap-2 hover:text-hett-brown font-medium"><Mail size={16} /> info@hett.nl</a>
                                    <a href="tel:0401234567" className="flex items-center gap-2 hover:text-hett-brown font-medium"><Phone size={16} /> 040 207 6003</a>
                                </p>
                            </div>

                            <h4 className="font-bold text-hett-dark mb-4 text-base">Openingstijden</h4>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                    <span>Maandag</span>
                                    <span className="font-medium">08:30 - 17:00</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                    <span>Dinsdag</span>
                                    <span className="font-medium">08:30 - 17:00</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                    <span>Woensdag</span>
                                    <span className="font-medium">08:30 - 17:00</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                    <span>Donderdag</span>
                                    <span className="font-medium">08:30 - 17:00</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                    <span>Vrijdag</span>
                                    <span className="font-medium">08:30 - 17:00</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                    <span>Zaterdag</span>
                                    <span className="font-medium">Op afspraak</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Zondag</span>
                                    <span>Gesloten</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-hett-dark mb-4 text-base">Afwijkende openingstijden</h4>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Goede vrijdag (18 april)</span>
                                    <span className="font-medium">09:30 - 16:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>2e Paasdag (21 april)</span>
                                    <span className="font-medium">11:00 - 16:00</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Koningsdag (26 april)</span>
                                    <span>Gesloten</span>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 h-64 relative bg-gray-200 group">
                            <img
                                src="https://images.unsplash.com/photo-1577416416421-72e49728cbce?q=80&w=1740&auto=format&fit=crop"
                                alt="Kaart"
                                className="w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                                <a
                                    href="https://maps.app.goo.gl/xaV7aijwoswQ7tuk8"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white text-hett-dark px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                                >
                                    <MapPin size={18} className="text-hett-brown" />
                                    Open in Google Maps
                                </a>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <button onClick={handleClose} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-20">
                                <X size={20} className="text-gray-600" />
                            </button>

                            {isSubmitted ? (
                                <div className="p-16 text-center">
                                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                                        <CheckCircle size={48} strokeWidth={3} />
                                    </div>
                                    <h2 className="text-3xl font-black text-hett-dark mb-4">Afspraak Bevestigd!</h2>
                                    <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                                        Bedankt {form.firstName}! We hebben uw afspraak ingepland op <strong>{selectedDate} Mei om {selectedTime}</strong>. U ontvangt spoedig een bevestiging per e-mail.
                                    </p>
                                    <button onClick={handleClose} className="bg-hett-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-hett-brown transition-colors">
                                        Sluiten
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                                    {/* Left: Summary */}
                                    <div className="hidden md:block w-1/3 bg-hett-dark text-white p-8">
                                        <h3 className="text-xl font-bold mb-6">Uw Afspraak</h3>
                                        <div className="space-y-6">
                                            <div>
                                                <span className="text-white/60 text-xs font-bold uppercase tracking-wider block mb-1">Datum</span>
                                                <span className="text-2xl font-black">{selectedDate} Mei 2024</span>
                                            </div>
                                            <div>
                                                <span className="text-white/60 text-xs font-bold uppercase tracking-wider block mb-1">Tijd</span>
                                                <span className="text-2xl font-black">{selectedTime}</span>
                                            </div>
                                            <div className="pt-6 border-t border-white/10">
                                                <span className="text-white/60 text-xs font-bold uppercase tracking-wider block mb-1">Locatie</span>
                                                <p className="text-sm leading-relaxed">
                                                    HETT B.V.<br />
                                                    Industrieweg 45<br />
                                                    5600 AA Eindhoven
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Form */}
                                    <div className="flex-1 p-8 md:p-10 overflow-y-auto">
                                        <div className="mb-6 md:hidden bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Gekozen moment:</span>
                                            <div className="font-black text-hett-dark">{selectedDate} Mei om {selectedTime}</div>
                                        </div>

                                        <h2 className="text-2xl font-black text-hett-dark mb-6">Vul uw gegevens in</h2>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Voornaam</label>
                                                    <input required type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-hett-brown outline-none" placeholder="Jan" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Achternaam</label>
                                                    <input required type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-hett-brown outline-none" placeholder="Jansen" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mailadres</label>
                                                <div className="relative">
                                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-hett-brown outline-none" placeholder="jan@example.com" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefoonnummer</label>
                                                <div className="relative">
                                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-hett-brown outline-none" placeholder="06 12345678" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Opmerking (Optioneel)</label>
                                                <textarea rows={3} value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-hett-brown outline-none resize-none" placeholder="Waar bent u specifiek naar op zoek?"></textarea>
                                            </div>

                                            <button type="submit" className="w-full bg-hett-brown text-white font-bold py-4 rounded-xl hover:bg-hett-dark transition-colors shadow-md flex items-center justify-center gap-2 mt-4">
                                                <Send size={18} /> Afspraak Bevestigen
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Showroom;
