
import React from 'react';
import { Clock, MapPin, Phone, Mail } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import CalendlyInline from '../src/components/CalendlyInline';
import { useTranslation } from 'react-i18next';

// Calendly URL for showroom appointments
const CALENDLY_URL = 'https://calendly.com/hett-info/30min?hide_event_type_details=1&hide_gdpr_banner=1';

const Showroom: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-white font-sans">

            {/* Header */}
            <PageHeader
                title={t('showroomPage.title')}
                subtitle={t('showroomPage.subtitle')}
                description={t('showroomPage.description')}
                image="/assets/images/showroom_advice.webp"
            />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: Calendly Booking Module */}
                    <div className="lg:col-span-7 bg-white border border-gray-200 rounded-[24px] shadow-sm overflow-hidden relative z-10">

                        {/* Module Header */}
                        <div className="p-8 md:p-10 border-b border-gray-100 text-center">
                            <img src="/assets/images/hett-logo-navbar.webp" alt="HETT" className="h-12 mx-auto mb-6 object-contain" />
                            <span className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-2 block">{t('showroomPage.locationLabel')}</span>
                            <h2 className="text-2xl md:text-3xl font-black text-hett-dark mb-4">
                                {t('showroomPage.planTitle')}
                            </h2>

                            <div className="flex justify-center gap-6 text-gray-500 text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <Clock size={18} />
                                    <span>{t('showroomPage.duration')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} />
                                    <span>{t('showroomPage.locationShort')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Calendly Embed */}
                        <div className="p-4 md:p-6">
                            <CalendlyInline url={CALENDLY_URL} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Info Sidebar */}
                    <div className="lg:col-span-5 bg-[#fcfbf7] rounded-[24px] p-8 md:p-10 space-y-8 h-full">

                        <div>
                            <h3 className="text-2xl font-black text-hett-dark mb-6">{t('showroomPage.openingContactTitle')}</h3>

                            <div className="space-y-4 text-sm text-gray-600 leading-relaxed mb-8">
                                <p>
                                    <strong className="block text-gray-900 text-base">HETT Veranda B.V.</strong>
                                    Hoppenkuil 17<br />
                                    5626 DD Eindhoven
                                </p>
                                <p>
                                    <span className="block">KVK: 832023291</span>
                                    <span className="block">BTW: NL866121171B01</span>
                                </p>
                                <p>
                                    <a href="mailto:info@hettveranda.nl" className="flex items-center gap-2 hover:text-hett-brown font-medium"><Mail size={16} /> info@hettveranda.nl</a>
                                    <a href="tel:+31685406033" className="flex items-center gap-2 hover:text-hett-brown font-medium"><Phone size={16} /> +31 (0)6 85 40 60 33</a>
                                </p>
                            </div>

                            <h4 className="font-bold text-hett-dark mb-4 text-base">Openingstijden</h4>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                    <span>{t('showroomPage.days.monday')}</span>
                                    <span className="font-medium">08:30 - 17:00</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                    <span>{t('showroomPage.days.tuesday')}</span>
                                    <span className="font-medium">08:30 - 17:00</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                    <span>{t('showroomPage.days.wednesday')}</span>
                                    <span className="font-medium">08:30 - 17:00</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                    <span>{t('showroomPage.days.thursday')}</span>
                                    <span className="font-medium">08:30 - 17:00</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                    <span>{t('showroomPage.days.friday')}</span>
                                    <span className="font-medium">08:30 - 17:00</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                    <span>{t('showroomPage.days.saturday')}</span>
                                    <span className="font-medium">{t('showroomPage.byAppointment')}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>{t('showroomPage.days.sunday')}</span>
                                    <span>{t('showroomPage.closed')}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-hett-dark mb-4 text-base">{t('showroomPage.specialHours')}</h4>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>{t('showroomPage.specialDays.goodFriday')}</span>
                                    <span className="font-medium">09:30 - 16:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t('showroomPage.specialDays.easterMonday')}</span>
                                    <span className="font-medium">11:00 - 16:00</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>{t('showroomPage.specialDays.kingsDay')}</span>
                                    <span>{t('showroomPage.closed')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 h-64 relative bg-gray-200 group">
                            <img
                                src="/assets/images/homepagina_2.webp"
                                alt={t('showroomPage.mapAlt')}
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
                                    {t('showroomPage.openInMaps')}
                                </a>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

        </div>
    );
};

export default Showroom;
