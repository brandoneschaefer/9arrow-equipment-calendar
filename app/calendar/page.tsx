'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Equipment {
  id: string;
  name: string;
}

interface Reservation {
  id: string;
  equipmentId: string;
  equipment: Equipment;
  companyName: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  checkInTime: string;
  checkOutTime: string;
  notes?: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    checkInTime: '',
    checkOutTime: '',
    notes: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch equipment and reservations
  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [equipmentRes, reservationsRes] = await Promise.all([
        fetch('/api/equipment'),
        fetch('/api/reservations'),
      ]);

      if (equipmentRes.ok) {
        setEquipment(await equipmentRes.json());
      }

      if (reservationsRes.ok) {
        setReservations(await reservationsRes.json());
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedEquipment || !formData.companyName || !formData.contactName) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipmentId: selectedEquipment,
          ...formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create reservation');
      }

      const newReservation = await response.json();
      setReservations([...reservations, newReservation]);
      setShowModal(false);
      setFormData({
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        checkInTime: '',
        checkOutTime: '',
        notes: '',
      });
      setSelectedEquipment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (reservationId: string) => {
    if (!confirm('Are you sure you want to delete this reservation?')) {
      return;
    }

    setDeletingId(reservationId);
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete reservation');
      }

      setReservations(reservations.filter((r) => r.id !== reservationId));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reservation');
    } finally {
      setDeletingId(null);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Group reservations by equipment
  const reservationsByEquipment = equipment.reduce(
    (acc, eq) => {
      acc[eq.id] = reservations.filter((r) => r.equipmentId === eq.id);
      return acc;
    },
    {} as Record<string, Reservation[]>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Equipment Calendar</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} />
            New Reservation
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Equipment Grid */}
        <div className="space-y-8">
          {equipment.map((eq) => (
            <div
              key={eq.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="bg-blue-500 text-white px-6 py-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Calendar size={20} />
                  {eq.name}
                </h2>
              </div>

              <div className="p-6">
                {reservationsByEquipment[eq.id]?.length > 0 ? (
                  <div className="space-y-4">
                    {reservationsByEquipment[eq.id].map((reservation) => (
                      <div
                        key={reservation.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-bold text-gray-900">
                                {reservation.companyName}
                              </h3>
                              <p className="text-gray-600">
                                Contact: {reservation.contactName}
                              </p>
                              {reservation.contactEmail && (
                                <p className="text-gray-600 text-sm">
                                  {reservation.contactEmail}
                                </p>
                              )}
                              {reservation.contactPhone && (
                                <p className="text-gray-600 text-sm">
                                  {reservation.contactPhone}
                                </p>
                              )}
                            </div>

                            <div className="text-right">
                              <div className="flex items-center justify-end gap-2 text-gray-600 mb-2">
                                <Clock size={16} />
                                <span className="font-semibold">
                                  {new Date(
                                    reservation.checkInTime
                                  ).toLocaleDateString()}{' '}
                                  {new Date(
                                    reservation.checkInTime
                                  ).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <div className="text-gray-600 text-sm">
                                to{' '}
                                {new Date(
                                  reservation.checkOutTime
                                ).toLocaleDateString()}{' '}
                                {new Date(
                                  reservation.checkOutTime
                                ).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              {reservation.notes && (
                                <p className="text-gray-500 text-sm mt-2 italic">
                                  {reservation.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(reservation.id)}
                          disabled={deletingId === reservation.id}
                          className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded transition disabled:opacity-50"
                          title="Delete reservation"
                        >
                          {deletingId === reservation.id ? (
                            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No reservations for this equipment
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">New Reservation</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment *
                </label>
                <select
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select equipment</option>
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) =>
                      setFormData({ ...formData, contactName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.checkInTime}
                    onChange={(e) =>
                      setFormData({ ...formData, checkInTime: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.checkOutTime}
                    onChange={(e) =>
                      setFormData({ ...formData, checkOutTime: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
                >
                  Create Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
