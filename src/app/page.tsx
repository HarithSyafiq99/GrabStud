"use client";

import React, { useState } from "react";

// --- MOCK DATA & TYPES ---
type Role = "Passenger" | "Driver" | "Admin" | null;
type Status = "Pending" | "Approved" | "Rejected";

interface User {
  id: string;
  email: string;
  role: Role;
  status: Status;
}

interface RideRequest {
  id: string;
  passengerId: string;
  from: string;
  to: string;
  date: string;
  time: string;
  status: "Waiting for Offers" | "Offer Received" | "Accepted";
  driverOfferPrice?: number;
  driverId?: string;
}

export default function GrabStudentApp() {
  // --- STATE MANAGEMENT ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    { id: "1", email: "admin@demo.com", role: "Admin", status: "Approved" },
    { id: "2", email: "driver@demo.com", role: "Driver", status: "Approved" },
    { id: "3", email: "passenger@demo.com", role: "Passenger", status: "Approved" },
    { id: "4", email: "newdriver@demo.com", role: "Driver", status: "Pending" },
  ]);
  const [requests, setRequests] = useState<RideRequest[]>([
    { id: "r1", passengerId: "3", from: "Block A", to: "Main Campus", date: "2026-10-01", time: "08:00", status: "Waiting for Offers" },
  ]);

  // Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [reqFrom, setReqFrom] = useState("");
  const [reqTo, setReqTo] = useState("");
  const [reqDate, setReqDate] = useState("");
  const [reqTime, setReqTime] = useState("");
  const [offerPrice, setOfferPrice] = useState<{ [key: string]: string }>({});

  // --- ACTIONS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find((u) => u.email === loginEmail);
    if (user) setCurrentUser(user);
    else alert("User not found. Try admin@demo.com, driver@demo.com, or passenger@demo.com");
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: RideRequest = {
      id: `r${Date.now()}`,
      passengerId: currentUser!.id,
      from: reqFrom,
      to: reqTo,
      date: reqDate,
      time: reqTime,
      status: "Waiting for Offers",
    };
    setRequests([...requests, newReq]);
    setReqFrom(""); setReqTo(""); setReqDate(""); setReqTime("");
  };

  const handleSubmitOffer = (reqId: string) => {
    const price = parseFloat(offerPrice[reqId]);
    if (!price || price <= 0) return alert("Please enter a valid price.");
    
    setRequests(requests.map(req => 
      req.id === reqId ? { ...req, status: "Offer Received", driverOfferPrice: price, driverId: currentUser!.id } : req
    ));
  };

  const handleApproveUser = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: "Approved" } : u));
  };

  // --- UI COMPONENTS ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F8FF] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-[#E6E6FA]">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">GrabStudent Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email (Mock Login)</label>
              <input 
                type="email" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#D8BFD8] focus:ring focus:ring-[#E6E6FA] p-2 border"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="passenger@demo.com"
                required 
              />
            </div>
            <button type="submit" className="w-full bg-[#D8BFD8] text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-[#cbb2cb] transition-colors shadow-sm">
              Sign In
            </button>
          </form>
          <div className="mt-6 border-2 border-dashed border-[#E6E6FA] rounded-lg p-6 text-center text-gray-500 bg-[#FAF9FF]">
            <p className="text-sm">Registration ID Dropzone</p>
            <p className="text-xs mt-1">(Drag & Drop Student ID / License here to register)</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.status === "Pending") {
    return (
      <div className="min-h-screen bg-[#F8F8FF] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md border border-[#E6E6FA]">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Account Pending Approval</h2>
          <p className="text-gray-600 mb-6">Your uploaded documents are being reviewed by an administrator. Please check back later[cite: 2].</p>
          <button onClick={() => setCurrentUser(null)} className="text-sm text-[#8a728a] hover:underline">Log out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8FF] flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-[#E6E6FA] p-6 shadow-sm flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 mb-8 tracking-tight">GrabStudent</h2>
        <nav className="flex-1 space-y-2">
          <div className="bg-[#E6E6FA] text-gray-800 px-4 py-2 rounded-lg font-medium shadow-sm cursor-pointer">
            Dashboard
          </div>
          {currentUser.role === "Admin" && (
             <div className="hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors">
               System Logs
             </div>
          )}
        </nav>
        <div className="mt-auto pt-6 border-t border-[#E6E6FA]">
          <p className="text-sm text-gray-600 font-medium">{currentUser.email}</p>
          <p className="text-xs text-gray-400 mb-4">{currentUser.role}</p>
          <button onClick={() => setCurrentUser(null)} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{currentUser.role} Dashboard</h1>

        {/* PASSENGER VIEW */}
        {currentUser.role === "Passenger" && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E6E6FA]">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Request a Ride</h3>
              <form onSubmit={handleCreateRequest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="From (e.g. Block A)" className="border rounded-lg p-2 focus:ring-[#E6E6FA] focus:border-[#D8BFD8]" value={reqFrom} onChange={e => setReqFrom(e.target.value)} required />
                <input type="text" placeholder="To (e.g. Main Campus)" className="border rounded-lg p-2 focus:ring-[#E6E6FA] focus:border-[#D8BFD8]" value={reqTo} onChange={e => setReqTo(e.target.value)} required />
                <input type="date" className="border rounded-lg p-2" value={reqDate} onChange={e => setReqDate(e.target.value)} required />
                <input type="time" className="border rounded-lg p-2" value={reqTime} onChange={e => setReqTime(e.target.value)} required />
                <button type="submit" className="md:col-span-2 bg-[#D8BFD8] text-gray-900 font-semibold py-2 rounded-lg shadow-sm hover:bg-[#cbb2cb]">Submit Request</button>
              </form>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">My Requests</h3>
              <div className="grid gap-4">
                {requests.filter(r => r.passengerId === currentUser.id).map(req => (
                  <div key={req.id} className="bg-white p-5 rounded-xl shadow-sm border border-[#E6E6FA] flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{req.from} → {req.to}</p>
                      <p className="text-sm text-gray-500">{req.date} at {req.time}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${req.status === 'Waiting for Offers' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {req.status}
                      </span>
                      {req.driverOfferPrice && (
                        <p className="mt-2 font-bold text-[#8a728a]">Offer: RM {req.driverOfferPrice}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DRIVER VIEW */}
        {currentUser.role === "Driver" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Passenger Requests</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {requests.filter(r => r.status === "Waiting for Offers").map(req => (
                <div key={req.id} className="bg-white p-5 rounded-xl shadow-sm border border-[#E6E6FA]">
                  <div className="mb-4">
                    <p className="font-bold text-gray-800">{req.from} → {req.to}</p>
                    <p className="text-sm text-gray-500">{req.date} at {req.time}</p>
                  </div>
                  <div className="flex space-x-2">
                    <input 
                      type="number" 
                      placeholder="Your Price (RM)" 
                      className="border rounded-lg p-2 w-full focus:ring-[#E6E6FA]"
                      value={offerPrice[req.id] || ''}
                      onChange={(e) => setOfferPrice({...offerPrice, [req.id]: e.target.value})}
                    />
                    <button 
                      onClick={() => handleSubmitOffer(req.id)}
                      className="bg-[#D8BFD8] text-gray-900 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-[#cbb2cb] whitespace-nowrap"
                    >
                      Send Offer
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Suggested Flat-Rate: RM 4.50[cite: 2]</p>
                </div>
              ))}
              {requests.filter(r => r.status === "Waiting for Offers").length === 0 && (
                <p className="text-gray-500 col-span-2">No pending passenger requests at the moment.</p>
              )}
            </div>
          </div>
        )}

        {/* ADMIN VIEW */}
        {currentUser.role === "Admin" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E6E6FA] overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">User Approvals[cite: 2]</h3>
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-[#E6E6FA] text-gray-500 text-sm">
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">ID Document</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 text-sm text-gray-800 font-medium">{user.email}</td>
                    <td className="py-4 text-sm text-gray-600">{user.role}</td>
                    <td className="py-4">
                      <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-500">Image</div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {user.status === "Pending" && (
                        <button 
                          onClick={() => handleApproveUser(user.id)}
                          className="text-[#8a728a] hover:text-purple-900 font-medium text-sm"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}