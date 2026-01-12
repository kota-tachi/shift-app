import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Firebase SDK
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";

// --- 【重要】Firebaseコンソールから取得した設定に置き換えてください ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ShiftApp = () => {
  // --- 状態管理 ---
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [staffName, setStaffName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');

  // --- 1. クラウドからデータをリアルタイム取得 ---
  useEffect(() => {
    // Firestoreの "shifts" コレクションを監視
    const unsubscribe = onSnapshot(collection(db, "shifts"), (snapshot) => {
      const shiftData = snapshot.docs.map(doc => ({
        id: doc.id, // FirestoreのドキュメントIDをFullCalendarのIDとして利用
        ...doc.data()
      }));
      setEvents(shiftData);
    });

    // コンポーネントがアンマウントされる際に監視を停止
    return () => unsubscribe();
  }, []);

  // --- 2. 新規シフトをクラウドに保存 ---
  const handleSaveShift = async (e) => {
    e.preventDefault();
    if (!staffName) return alert('スタッフ名を入力してください');

    const newShift = {
      title: `${staffName}: ${startTime}-${endTime}`,
      start: `${selectedDate}T${startTime}:00`,
      end: `${selectedDate}T${endTime}:00`,
      backgroundColor: '#3b82f6', // 青色
      borderColor: '#3b82f6',
    };

    try {
      await addDoc(collection(db, "shifts"), newShift);
      setIsModalOpen(false);
      setStaffName('');
    } catch (error) {
      console.error("Firebase保存エラー:", error);
      alert("保存に失敗しました。");
    }
  };

  // --- 3. クラウドからシフトを削除 ---
  const handleEventClick = async (clickInfo) => {
    if (window.confirm(`「${clickInfo.event.title}」を削除しますか？`)) {
      try {
        await deleteDoc(doc(db, "shifts", clickInfo.event.id));
      } catch (error) {
        console.error("Firebase削除エラー:", error);
      }
    }
  };

  // 日付クリックでモーダルを開く
  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
      <div className="max-w-5xl mx-auto bg-white p-4 md:p-6 rounded-2xl shadow-xl">
        <header className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-blue-600">共有シフトカレンダー</h1>
            <p className="text-xs text-slate-400 mt-1">※変更は全員にリアルタイムで反映されます</p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            <span className="text-xs font-bold text-green-700">ONLINE</span>
          </div>
        </header>

        {/* カレンダー表示 */}
        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="ja"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
            }}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            dayMaxEvents={true} // イベントが多い場合に「+他x件」と表示
          />
        </div>
      </div>

      {/* 入力モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-blue-600 p-5 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">{selectedDate} のシフト</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-3xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSaveShift} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">スタッフ名</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="お名前を入力"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">開始</label>
                  <input 
                    type="time" 
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">終了</label>
                  <input 
                    type="time" 
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)} 
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition"
                >
                  キャンセル
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-95"
                >
                  保存して共有
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 簡単なCSSカスタム */}
      <style>{`
        .fc-header-toolbar { margin-bottom: 1.5rem !important; flex-wrap: wrap; gap: 0.5rem; }
        .fc-toolbar-title { font-size: 1.2rem !important; font-weight: bold; }
        .fc-button-primary { background-color: #3b82f6 !important; border: none !important; }
        .fc-button-primary:hover { background-color: #2563eb !important; }
        .fc-daygrid-event { cursor: pointer; border-radius: 4px; padding: 2px 4px; font-size: 0.85rem; }
      `}</style>
    </div>
  );
};

export default ShiftApp;