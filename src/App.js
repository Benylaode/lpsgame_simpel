import React, { useState, useEffect, useReducer } from 'react';

// Definisi harga properti
const propertyPrices = {
  'Mediterranean Avenue': 60,
  'Baltic Avenue': 60,
  'Oriental Avenue': 100,
  'Vermont Avenue': 100,
  'Connecticut Avenue': 120,
  'St. Charles Place': 140,
  'States Avenue': 140,
  'Virginia Avenue': 160,
  'St. James Place': 180,
  'Tennessee Avenue': 180,
  'New York Avenue': 200,
  'Kentucky Avenue': 220,
  'Indiana Avenue': 220,
  'Illinois Avenue': 240,
  'Atlantic Avenue': 260,
  'Ventnor Avenue': 260,
  'Marvin Gardens': 280,
  'Pacific Avenue': 300,
  'North Carolina Avenue': 300,
  'Pennsylvania Avenue': 320,
  'Park Place': 350,
  'Boardwalk': 400,
};

// Definisi ubin papan permainan
const initialTiles = [
  { name: 'GO', owner: null }, { name: 'Mediterranean Avenue', owner: null }, { name: 'Community Chest', owner: null }, { name: 'Baltic Avenue', owner: null }, { name: 'Income Tax', owner: null },
  { name: 'Reading Railroad', owner: null }, { name: 'Oriental Avenue', owner: null }, { name: 'Chance', owner: null }, { name: 'Vermont Avenue', owner: null }, { name: 'Connecticut Avenue', owner: null },
  { name: 'Jail / Just Visiting', owner: null }, { name: 'St. Charles Place', owner: null }, { name: 'Electric Company', 'owner': null }, { name: 'States Avenue', owner: null }, { name: 'Virginia Avenue', owner: null },
  { name: 'Pennsylvania Railroad', owner: null }, { name: 'St. James Place', owner: null }, { name: 'Community Chest', owner: null }, { name: 'Tennessee Avenue', owner: null }, { name: 'New York Avenue', owner: null },
  { name: 'Free Parking', owner: null }, { name: 'Kentucky Avenue', owner: null }, { name: 'Chance', owner: null }, { name: 'Indiana Avenue', owner: null }, { name: 'Illinois Avenue', owner: null },
  { name: 'B. & O. Railroad', owner: null }, { name: 'Atlantic Avenue', owner: null }, { name: 'Ventnor Avenue', owner: null }, { name: 'Water Works', owner: null }, { name: 'Marvin Gardens', owner: null },
  { name: 'Go to Jail', owner: null }, { name: 'Pacific Avenue', owner: null }, { name: 'North Carolina Avenue', owner: null }, { name: 'Community Chest', owner: null }, { name: 'Pennsylvania Avenue', owner: null },
  { name: 'Short Line', owner: null }, { name: 'Chance', owner: null }, { name: 'Park Place', owner: null }, { name: 'Luxury Tax', owner: null }, { name: 'Boardwalk', owner: null },
];

// Reducer untuk mengelola state game
function gameReducer(state, action) {
  switch (action.type) {
    case 'ROLL_DICE': {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const total = dice1 + dice2;

      const newPlayers = [...state.players];
      const currentPlayerIndex = state.currentPlayer;
      const currentPlayer = { ...newPlayers[currentPlayerIndex] };

      const oldPosition = currentPlayer.position;
      const newPosition = (oldPosition + total) % 40;
      currentPlayer.position = newPosition;

      newPlayers[currentPlayerIndex] = currentPlayer;

      let newMessage = `${currentPlayer.name} melempar dadu: ${dice1} + ${dice2} = ${total}. Bergerak dari ${state.tiles[oldPosition].name} ke ${state.tiles[newPosition].name}.`;
      let newCanBuy = false;
      let newBuyPosition = null;
      let nextPlayerIndex = (currentPlayerIndex + 1) % newPlayers.length;

      // Fungsi helper untuk memeriksa apakah properti bisa dibeli
      const canBuyProperty = (pos) => {
        if (!state.tiles[pos]) return false;
        const tile = state.tiles[pos];
        if (!propertyPrices[tile.name]) return false;
        if (tile.owner !== null) return false;
        if (currentPlayer.money < propertyPrices[tile.name]) return false;
        return true;
      };

      if (canBuyProperty(newPosition)) {
        newMessage += ` Properti ini tersedia untuk dibeli dengan harga $${propertyPrices[state.tiles[newPosition].name]}. Klik beli jika ingin membeli.`;
        newCanBuy = true;
        newBuyPosition = newPosition;
        nextPlayerIndex = currentPlayerIndex; // Tetap giliran pemain jika bisa membeli
      } else {
        newMessage += ` Giliran ${newPlayers[nextPlayerIndex].name}.`;
      }

      return {
        ...state,
        players: newPlayers,
        message: newMessage,
        canBuy: newCanBuy,
        buyPosition: newBuyPosition,
        currentPlayer: nextPlayerIndex,
      };
    }
    case 'BUY_PROPERTY': {
      const pos = state.buyPosition;
      // Fungsi helper untuk memeriksa apakah properti bisa dibeli
      const canBuyProperty = (pos) => {
        if (!state.tiles[pos]) return false;
        const tile = state.tiles[pos];
        if (!propertyPrices[tile.name]) return false;
        if (tile.owner !== null) return false;
        const currentPlayer = state.players[state.currentPlayer];
        if (currentPlayer.money < propertyPrices[tile.name]) return false;
        return true;
      };

      if (pos !== null && canBuyProperty(pos)) {
        const price = propertyPrices[state.tiles[pos].name];
        const playerIndex = state.currentPlayer;
        const newTiles = [...state.tiles];
        newTiles[pos] = { ...newTiles[pos], owner: playerIndex };

        const newPlayers = [...state.players];
        newPlayers[playerIndex] = { ...newPlayers[playerIndex], money: newPlayers[playerIndex].money - price };

        const nextPlayerIndex = (playerIndex + 1) % newPlayers.length;
        const newMessage = `${newPlayers[playerIndex].name} membeli properti ${newTiles[pos].name} seharga $${price}. Giliran ${newPlayers[nextPlayerIndex].name}.`;

        return {
          ...state,
          tiles: newTiles,
          players: newPlayers,
          message: newMessage,
          canBuy: false,
          buyPosition: null,
          currentPlayer: nextPlayerIndex,
        };
      }
      return state;
    }
    case 'RESET_GAME':
      return {
        tiles: initialTiles,
        players: [
          { name: 'Player 1', position: 0, money: 1500 },
          { name: 'Player 2', position: 0, money: 1500 },
        ],
        currentPlayer: 0,
        message: 'Game dimulai! Giliran Player 1.',
        canBuy: false,
        buyPosition: null,
      };
    default:
      return state;
  }
}

// Komponen Halaman Home
const HomePage = ({ setCurrentPage }) => {
  // Data statistik literasi keuangan dari index.php
  const literasiData = {
    labels: ['Tabungan', 'Investasi', 'Asuransi', 'Pinjaman', 'Manajemen Uang'],
    data: [55, 42, 33, 25, 60],
  };

  useEffect(() => {
    // Pastikan Chart.js sudah dimuat secara global sebelum mencoba menggunakannya
    // Script Chart.js harus dimuat di public/index.html
    if (window.Chart) {
      const ctx = document.getElementById('literasiChart');
      if (ctx) {
        // Hancurkan instance chart yang ada sebelum membuat yang baru
        if (window.literasiChartInstance) {
          window.literasiChartInstance.destroy();
        }
        window.literasiChartInstance = new window.Chart(ctx.getContext('2d'), { // Menggunakan window.Chart
          type: 'bar',
          data: {
            labels: literasiData.labels,
            datasets: [{
              label: 'Persentase Literasi (%)',
              data: literasiData.data,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false, // Penting untuk responsivitas
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                grid: {
                  color: 'rgba(255, 255, 255, 0.2)' // Warna grid untuk kontras dengan background gelap
                },
                ticks: {
                  color: '#fff' // Warna teks ticks
                }
              },
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.2)'
                },
                ticks: {
                  color: '#fff'
                }
              }
            },
            plugins: {
              legend: {
                labels: {
                  color: '#fff' // Warna label legenda
                }
              }
            }
          }
        });
      }
    }
    // Cleanup saat komponen unmount
    return () => {
      if (window.literasiChartInstance) {
        window.literasiChartInstance.destroy();
      }
    };
  }, []); // Hanya jalankan sekali saat mount

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="hero text-center py-24 px-5 bg-gradient-to-br from-[#1e3a8a] to-[#1e3a8a] rounded-xl shadow-2xl mb-12 relative overflow-hidden">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-wide text-white drop-shadow-lg">
          Tingkatkan Literasi Keuanganmu Bersama FINPLAYZ Edu Game
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-6 drop-shadow-md">Main Asik, Finansial Cerdas!</h2>
        <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-sm">
          Pelajari dan uji pengetahuanmu tentang peran Lembaga Penjamin Simpanan (LPS) dan konsep keuangan lainnya.
        </p>
        <button
          onClick={() => setCurrentPage('quiz')}
          className="btn-hero bg-yellow-400 text-blue-900 px-10 py-4 font-bold rounded-full text-xl shadow-lg hover:bg-yellow-500 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Mulai Kuis
        </button>
      </div>

      <section className="statistik-literasi bg-blue-900 bg-opacity-90 p-8 rounded-xl shadow-xl mb-12 border border-blue-700">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">📊 Statistik Literasi Keuangan Gen Z Indonesia</h2>
        <p className="text-gray-200 mb-8 text-center max-w-2xl mx-auto">
          Rendahnya tingkat literasi keuangan menunjukkan urgensi edukasi yang lebih intensif dan menarik.
        </p>
        <div className="statistik-chart-container h-80 w-full max-w-2xl mx-auto bg-blue-800 p-4 rounded-lg shadow-inner">
          <canvas id="literasiChart"></canvas>
        </div>
      </section>

      {/* Infografis Literasi Keuangan Gen Z */}
      <section className="infografis bg-blue-900 bg-opacity-90 p-8 rounded-xl shadow-xl mb-12 border border-blue-700 text-center">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6">Infografis Literasi Keuangan Gen Z</h2>
        <p className="text-gray-200 mb-8 max-w-2xl mx-auto">
          Berikut adalah hasil survei terbaru mengenai tingkat literasi keuangan di kalangan Gen Z Indonesia.
        </p>
        <img
          src="/genz-literasi.png" // Menggunakan jalur relatif ke folder public
          alt="Infografis Literasi Keuangan Gen Z"
          className="max-w-full h-auto rounded-lg shadow-xl mx-auto transform transition-transform duration-300 hover:scale-103"
        />
      </section>

      <section className="features grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        <div className="feature-card bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <img src="https://img.icons8.com/ios/50/open-book--v1.png" alt="Materi Edukasi" className="mb-6 w-20 h-20 mx-auto" />
          <h3 className="text-2xl font-bold text-blue-800 mb-3">Materi Edukasi Keuangan</h3>
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">Pelajari topik-topik penting seperti tabungan, investasi, pinjaman, dan pengelolaan anggaran.</p>
          <button onClick={() => setCurrentPage('materi')} className="btn-materi bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-md hover:bg-blue-700">Baca Materi</button>
        </div>
        <div className="feature-card bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <img src="https://img.icons8.com/ios/50/quiz.png" alt="Kuis Interaktif" className="mb-6 w-20 h-20 mx-auto" />
          <h3 className="text-2xl font-bold text-blue-800 mb-3">Kuis Interaktif</h3>
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">Uji pemahamanmu melalui kuis singkat dengan cara yang seru dan menantang.</p>
          <button onClick={() => setCurrentPage('quiz')} className="btn-materi bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-md hover:bg-blue-700">Mulai Kuis</button>
        </div>
        <div className="feature-card bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <img src="https://img.icons8.com/ios/50/trophy.png" alt="Skor & Feedback" className="mb-6 w-20 h-20 mx-auto" />
          <h3 className="text-2xl font-bold text-blue-800 mb-3">Skor & Feedback</h3>
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">Dapatkan skor langsung setelah kuis dan lihat feedback untuk meningkatkan pemahamanmu.</p>
          <button onClick={() => setCurrentPage('score')} className="btn-materi bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-md hover:bg-blue-700">Lihat Skor</button>
        </div>
      </section>
    </div>
  );
};

// Komponen Halaman Materi
const MateriPage = ({ setCurrentPage }) => (
  <div className="container mx-auto px-6 py-8">
    <div className="flex flex-col items-center p-8 bg-white bg-opacity-90 rounded-xl shadow-xl max-w-4xl mx-auto my-8 border border-gray-200 text-gray-800">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">📘 Materi Edukasi Keuangan</h1>
      <p className="text-gray-700 mb-4 text-center">Berikut ini adalah materi interaktif dalam bentuk PDF. Gunakan scrollbar atau kontrol di bawah untuk membaca lebih lanjut:</p>
      <div className="w-full h-[600px] border-2 border-gray-300 rounded-lg overflow-hidden shadow-inner mb-6">
        {/* Menggunakan jalur relatif ke folder public */}
        <iframe src="/files/materi keuangan.pdf" className="w-full h-full border-none" title="Materi Keuangan PDF"></iframe>
      </div>
      <a href="/files/materi keuangan.pdf" download className="px-6 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 mb-6">
        ⬇️ Unduh Materi PDF
      </a>
      <button
        onClick={() => setCurrentPage('home')}
        className="px-6 py-3 bg-purple-600 text-white font-bold rounded-full shadow-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105"
      >
        🏠 Kembali ke Beranda
      </button>
    </div>
  </div>
);

// Komponen Halaman Kuis
const QuizPage = ({ setCurrentPage }) => {
  const questions = [
    {
      q: "Apa itu Lembaga Penjamin Simpanan (LPS)?",
      opts: [
        "Lembaga yang memberi pinjaman kepada bank",
        "Lembaga yang menjamin simpanan nasabah di bank",
        "Lembaga yang mencetak uang"
      ],
      correct: 'b',
      name: "q1"
    },
    {
      q: "Maksimal jumlah simpanan yang dijamin LPS adalah?",
      opts: [
        "Rp500 juta per nasabah per bank",
        "Rp1 miliar per rekening",
        "Tidak terbatas"
      ],
      correct: 'a',
      name: "q2"
    },
    {
      q: "Dana LPS berasal dari?",
      opts: [
        "Dana APBN",
        "Premi dari bank peserta",
        "Pajak masyarakat"
      ],
      correct: 'b',
      name: "q3"
    },
    {
      q: "Apa fungsi utama dari LPS?",
      opts: [
        "Mengatur kebijakan moneter",
        "Menjamin simpanan nasabah bank",
        "Mengawasi pasar modal"
      ],
      correct: 'b',
      name: "q4"
    },
    {
      q: "Produk simpanan mana yang dijamin oleh LPS?",
      opts: [
        "Saham",
        "Deposito",
        "Reksadana"
      ],
      correct: 'b',
      name: "q5"
    },
    {
      q: "Apakah LPS menjamin simpanan di semua jenis bank?",
      opts: [
        "Ya, termasuk bank asing",
        "Hanya bank yang terdaftar dan diawasi oleh OJK",
        "Tidak, hanya bank milik pemerintah"
      ],
      correct: 'b',
      name: "q6"
    },
    {
      q: "Apa yang terjadi jika bank gagal memenuhi kewajiban ke nasabah?",
      opts: [
        "Nasabah kehilangan seluruh simpanannya",
        "LPS akan menjamin simpanan nasabah sesuai ketentuan",
        "Ya, dengan mengatur suku bunga"
      ],
      correct: 'b',
      name: "q7"
    },
    {
      q: "Apakah LPS berperan dalam menjaga stabilitas keuangan nasional?",
      opts: [
        "Tidak, itu tugas Bank Indonesia",
        "Ya, melalui penjaminan simpanan dan resolusi bank",
        "Nasabah harus menunggu hingga bank pulih"
      ],
      correct: 'b',
      name: "q8"
    },
    {
      q: "Mengapa LPS penting bagi perbankan di Indonesia?",
      opts: [
        "Menjaga stabilitas finansial",
        "Mengatur suku bunga",
        "Mengontrol inflasi"
      ],
      correct: 'a',
      name: "q9"
    },
    {
      q: "Apa saja syarat agar simpanan dijamin oleh LPS?",
      opts: [
        "Tercatat dalam pembukuan & tidak melebihi tingkat bunga penjaminan",
        "Harus dalam bentuk saham",
        "Harus disimpan di luar negeri"
      ],
      correct: 'a',
      name: "q10"
    }
  ];

  const [selectedAnswers, setSelectedAnswers] = useState({});

  const handleAnswerChange = (qName, value) => {
    setSelectedAnswers(prev => ({ ...prev, [qName]: value }));
  };

  const handleSubmitQuiz = (e) => {
    e.preventDefault();
    let score = 0;
    const feedback = {};

    questions.forEach(q => {
      const userAnswer = selectedAnswers[q.name];
      const isCorrect = userAnswer === q.correct;
      if (isCorrect) {
        score++;
      }
      feedback[q.name] = {
        status: isCorrect ? 'Benar' : 'Salah',
        your_answer: userAnswer ? q.opts[userAnswer.charCodeAt(0) - 97] : 'Tidak menjawab',
        correct_answer: q.opts[q.correct.charCodeAt(0) - 97]
      };
    });

    // Pass score and feedback to the ScorePage
    setCurrentPage('score', { score, feedback });
  };

  return (
    <div className="container-quiz bg-blue-900 bg-opacity-90 p-8 rounded-xl shadow-xl max-w-3xl mx-auto my-8 text-white">
      <h1 className="text-3xl font-bold text-center text-yellow-400 mb-8">Kuis Literasi Keuangan LPS</h1>
      <form onSubmit={handleSubmitQuiz} className="space-y-6">
        {questions.map((q, i) => (
          <div key={q.name} className="quiz-card bg-blue-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4">{i + 1}. {q.q}</h3>
            {q.opts.map((opt, idx) => {
              const letter = String.fromCharCode(97 + idx);
              return (
                <label key={letter} className="block mb-3 cursor-pointer p-3 rounded-lg bg-blue-700 hover:bg-blue-600 transition duration-200">
                  <input
                    type="radio"
                    name={q.name}
                    value={letter}
                    checked={selectedAnswers[q.name] === letter}
                    onChange={() => handleAnswerChange(q.name, letter)}
                    className="mr-3 transform scale-110 accent-green-400"
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        ))}
        <div className="text-center mt-8">
          <button type="submit" className="px-8 py-4 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 text-xl">
            Lihat Hasil
          </button>
        </div>
      </form>
    </div>
  );
};

// Komponen Halaman Skor
const ScorePage = ({ setCurrentPage, scoreData }) => {
  const { score, feedback } = scoreData || { score: 0, feedback: {} }; // Default values if scoreData is null

  const getFeedbackMessage = (finalScore) => {
    if (finalScore === 10) {
      return "Luar biasa! Kamu sangat paham tentang LPS!";
    } else if (finalScore >= 7) {
      return "Bagus! Tapi masih ada yang bisa kamu pelajari.";
    } else {
      return "Yuk belajar lagi tentang LPS supaya makin paham!";
    }
  };

  return (
    <div className="container-result bg-blue-900 bg-opacity-90 p-8 rounded-xl shadow-xl max-w-3xl mx-auto my-8 text-white text-center">
      <h1 className="text-4xl font-bold text-yellow-400 mb-6">Hasil Kuis Kamu</h1>
      <p className="text-lg mb-4">Skor kamu adalah:</p>
      <div className="score-circle bg-green-500 text-white text-5xl font-bold w-32 h-32 flex items-center justify-center rounded-full mx-auto mb-6 shadow-lg">
        {score} / 10
      </div>
      <p className={`text-xl font-semibold mb-8 ${score === 10 ? 'text-green-400' : score >= 7 ? 'text-yellow-400' : 'text-red-400'}`}>
        {getFeedbackMessage(score)}
      </p>

      <div className="flex justify-center gap-6 mb-10">
        <button
          onClick={() => setCurrentPage('quiz')}
          className="px-8 py-4 bg-blue-500 text-white font-bold rounded-full shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Ulangi Kuis
        </button>
        <button
          onClick={() => setCurrentPage('home')}
          className="px-8 py-4 bg-purple-600 text-white font-bold rounded-full shadow-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Kembali ke Beranda
        </button>
      </div>

      <div className="feedback text-left bg-blue-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-yellow-300 mb-4">Ulasan Jawaban Kamu</h2>
        <ol className="list-decimal list-inside space-y-3">
          {Object.keys(feedback).map((qName, index) => (
            <li key={qName} className="text-lg">
              {feedback[qName].status === 'Benar' ? (
                <span className="text-green-400">✅ Benar</span>
              ) : (
                <span className="text-red-400">❌ Salah</span>
              )}
              — Jawaban kamu: <strong>{feedback[qName].your_answer}</strong>
              {feedback[qName].status === 'Salah' && (
                <span>, Jawaban benar: <strong>{feedback[qName].correct_answer}</strong></span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

// Komponen Halaman Tentang
const AboutPage = ({ setCurrentPage }) => (
  <div className="about-section max-w-4xl mx-auto my-8 p-8 bg-white bg-opacity-90 rounded-xl shadow-md border border-gray-200 text-gray-800">
    <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">Tentang FINPLAYZ</h1>

    <div className="highlight-box bg-gray-50 border-l-4 border-blue-500 p-6 mb-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-blue-700 mb-3">🎯 Visi & Misi</h2>
      <p className="mb-2"><strong>Visi:</strong> Meningkatkan literasi keuangan generasi muda Indonesia agar lebih bijak dalam mengelola keuangan sejak dini.</p>
      <p><strong>Misi:</strong> Menyediakan media edukatif berbasis game yang interaktif, menyenangkan, dan mudah dipahami oleh anak muda.</p>
    </div>

    <div className="highlight-box bg-gray-50 border-l-4 border-blue-500 p-6 mb-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-blue-700 mb-3">👥 Target Pengguna</h2>
      <p>Platform ini dirancang khusus untuk Generasi Z (remaja usia 15–25 tahun) yang gemar menggunakan teknologi, interaktif, dan lebih suka belajar lewat cara yang engaging daripada konvensional.</p>
    </div>

    <div className="highlight-box bg-gray-50 border-l-4 border-blue-500 p-6 mb-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-blue-700 mb-3">🕹️ Keunggulan Gamifikasi</h2>
      <p>Metode gamifikasi membuat proses belajar terasa seperti bermain. Dengan kuis interaktif, reward poin, dan tampilan yang menarik, pengguna lebih semangat untuk belajar tanpa merasa bosan. Ini terbukti meningkatkan retensi informasi dan keterlibatan pengguna secara signifikan.</p>
    </div>

    <div className="video-section text-center my-8">
      <h2 className="text-2xl font-semibold text-blue-700 mb-4">📽️ Video Singkat: Belajar Ngatur Uang Ala Gen Z</h2>
      <div className="w-full max-w-2xl mx-auto h-[400px] rounded-lg overflow-hidden shadow-lg">
        <iframe src="https://www.youtube.com/embed/74R3eL20eC4" className="w-full h-full border-none" allowFullScreen title="Video Edukasi Finansial"></iframe>
      </div>
      <p className="text-sm text-gray-500 mt-2">*Video contoh edukasi finansial dari YouTube</p>
    </div>

    <div className="text-center mt-8">
      <button
        onClick={() => setCurrentPage('home')}
        className="px-6 py-3 bg-purple-600 text-white font-bold rounded-full shadow-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105"
      >
        🏠 Kembali ke Beranda
      </button>
    </div>
  </div>
);

// Komponen Halaman Admin
const AdminPage = ({ setCurrentPage }) => (
  <div className="flex flex-col items-center justify-center p-4 text-center bg-white bg-opacity-90 rounded-xl shadow-md max-w-xl mx-auto my-8">
    <h1 className="text-3xl font-bold text-blue-700 mb-4">Halaman Admin</h1>
    <p className="text-gray-700 text-lg mb-6">Ini adalah halaman khusus untuk administrator.</p>
    <button
      onClick={() => setCurrentPage('home')}
      className="px-6 py-3 bg-purple-600 text-white font-bold rounded-full shadow-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105"
    >
      🏠 Kembali ke Beranda
    </button>
  </div>
);

// Komponen Halaman User
const UserPage = ({ setCurrentPage }) => (
  <div className="flex flex-col items-center justify-center p-4 text-center bg-white bg-opacity-90 rounded-xl shadow-md max-w-xl mx-auto my-8">
    <h1 className="text-3xl font-bold text-blue-700 mb-4">Halaman Pengguna</h1>
    <p className="text-gray-700 text-lg mb-6">Ini adalah halaman khusus untuk pengguna.</p>
    <button
      onClick={() => setCurrentPage('home')}
      className="px-6 py-3 bg-purple-600 text-white font-bold rounded-full shadow-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105"
    >
      🏠 Kembali ke Beranda
    </button>
  </div>
);


function App() {
  // State untuk mengelola halaman saat ini
  const [currentPage, setCurrentPage] = useState('home');
  // State untuk menyimpan data kuis (untuk dikirim ke halaman skor)
  const [quizScoreData, setQuizScoreData] = useState(null);

  // Fungsi untuk menentukan kelas CSS ubin berdasarkan namanya
  const getTileClass = (name) => {
    if (['Income Tax', 'Luxury Tax'].includes(name)) return 'bg-red-200';
    if (['Chance', 'Community Chest'].includes(name)) return 'bg-yellow-100';
    if (name.includes('Railroad') || name === 'Short Line') return 'bg-blue-100';
    if (['Water Works', 'Electric Company'].includes(name)) return 'bg-green-100';
    if (['GO', 'Jail / Just Visiting', 'Free Parking', 'Go to Jail'].includes(name)) return 'bg-gray-200 font-bold text-center text-sm';
    return 'bg-gray-100';
  };

  // Menggunakan useReducer untuk state game
  const [game, dispatch] = useReducer(gameReducer, {}, () => {
    const savedGame = localStorage.getItem('monopolyGame');
    return savedGame ? JSON.parse(savedGame) : {
      tiles: initialTiles,
      players: [
        { name: 'Player 1', position: 0, money: 1500 },
        { name: 'Player 2', position: 0, money: 1500 },
        ],
      currentPlayer: 0,
      message: 'Game dimulai! Giliran Player 1.',
      canBuy: false,
      buyPosition: null,
    };
  });

  // Effect untuk menyimpan status game ke localStorage setiap kali game berubah
  useEffect(() => {
    localStorage.setItem('monopolyGame', JSON.stringify(game));
  }, [game]);

  // Fungsi untuk mengatur halaman saat ini, bisa juga menerima data untuk halaman skor
  const handleSetCurrentPage = (page, data = null) => {
    setCurrentPage(page);
    if (page === 'score') {
      setQuizScoreData(data);
    } else {
      setQuizScoreData(null); // Clear data if not going to score page
    }
  };

  // Render konten berdasarkan halaman saat ini
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={handleSetCurrentPage} />;
      case 'game':
        return (
          <div className="bg-gradient-to-br from-blue-100 to-yellow-100 text-gray-800 p-4 font-inter">
            {/* Papan Permainan */}
            <div className="grid grid-cols-11 gap-0.5 mx-auto max-w-4xl shadow-xl bg-white p-2 rounded-xl border-2 border-gray-300">
              {positions.map((pos, index) => {
                if (pos === null) {
                  return <div key={index} className="w-20 h-20 bg-gray-50 rounded-md"></div>;
                } else {
                  const tile = game.tiles[pos];
                  const tileClass = getTileClass(tile.name);
                  const ownerClass = tile.owner !== null ? `owner-p${tile.owner}` : ''; // Custom classes for owner colors

                  return (
                    <div
                      key={index}
                      className={`relative w-20 h-20 border border-gray-400 p-1 text-xs flex flex-col justify-between items-center rounded-md overflow-hidden ${tileClass} ${ownerClass}`}
                      style={{
                        backgroundColor: tile.owner === 0 ? '#f1948a' : tile.owner === 1 ? '#85c1e9' : '',
                        borderColor: tile.owner !== null ? 'transparent' : '', // Remove border if owned
                      }}
                    >
                      <strong className="text-center leading-tight">{tile.name}</strong>
                      {propertyPrices[tile.name] && tile.owner === null && (
                        <small className="text-gray-600">${propertyPrices[tile.name]}</small>
                      )}
                      {game.players.map((player, pi) => (
                        player.position === pos && (
                          <div
                            key={pi}
                            className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border border-gray-600 ${pi === 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                            title={player.name}
                          ></div>
                        )
                      ))}
                    </div>
                  );
                }
              })}
            </div>

            {/* Status Permainan */}
            <div className="bg-white bg-opacity-90 p-4 rounded-xl shadow-md max-w-2xl mx-auto my-6 border border-gray-200">
              <p className="font-semibold text-lg text-gray-700">
                Status: <span className="font-normal">{game.message}</span>
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-center gap-4 mb-8">
              {game.canBuy && game.buyPosition !== null ? (
                <button
                  onClick={() => dispatch({ type: 'BUY_PROPERTY' })}
                  className="px-6 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Beli Properti Ini (${propertyPrices[game.tiles[game.buyPosition].name]})
                </button>
              ) : (
                <button
                  onClick={() => dispatch({ type: 'ROLL_DICE' })}
                  className="px-6 py-3 bg-blue-500 text-white font-bold rounded-full shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Giliran {game.players[game.currentPlayer].name}: Lempar Dadu
                </button>
              )}
              <button
                onClick={() => dispatch({ type: 'RESET_GAME' })}
                className="px-6 py-3 bg-red-500 text-white font-bold rounded-full shadow-lg hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Reset Game
              </button>
            </div>

            {/* Info Pemain */}
            <div className="max-w-xl mx-auto bg-white bg-opacity-90 p-5 rounded-xl shadow-md border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Info Pemain</h2>
              <ul className="space-y-3">
                {game.players.map((p, index) => (
                  <li key={index} className={`flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm ${index === game.currentPlayer ? 'border-2 border-blue-500' : ''}`}>
                    <strong className={`text-lg ${index === 0 ? 'text-red-600' : 'text-blue-600'}`}>{p.name}</strong>
                    <span className="text-xl font-semibold text-gray-800">Uang: ${p.money}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'materi':
        return <MateriPage setCurrentPage={handleSetCurrentPage} />;
      case 'quiz':
        return <QuizPage setCurrentPage={handleSetCurrentPage} />;
      case 'score':
        return <ScorePage setCurrentPage={handleSetCurrentPage} scoreData={quizScoreData} />;
      case 'about':
        return <AboutPage setCurrentPage={handleSetCurrentPage} />;
      case 'admin':
        return <AdminPage setCurrentPage={handleSetCurrentPage} />;
      case 'user':
        return <UserPage setCurrentPage={handleSetCurrentPage} />;
      default:
        return <HomePage setCurrentPage={handleSetCurrentPage} />;
    }
  };

  // Layout papan permainan (tetap di sini karena digunakan di GamePage)
  const positions = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    39, null, null, null, null, null, null, null, null, null, 11,
    38, null, null, null, null, null, null, null, null, null, 12,
    37, null, null, null, null, null, null, null, null, null, 13,
    36, null, null, null, null, null, null, null, null, null, 14,
    35, null, null, null, null, null, null, null, null, null, 15,
    34, null, null, null, null, null, null, null, null, null, 16,
    33, null, null, null, null, null, null, null, null, null, 17,
    32, null, null, null, null, null, null, null, null, null, 18,
    31, null, null, null, null, null, null, null, null, null, 19,
    30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20
  ];

  return (
    // Mengaplikasikan background-image dari style.css
    // Div ini sekarang mengisi seluruh viewport dan tidak akan menggulir
    <div
      className="w-full h-screen font-poppins text-white relative overflow-hidden" // Mengatur tinggi 100vh dan overflow:hidden
      style={{
        backgroundColor: '#1e293b', // Warna solid dark blue dari style.css
        backgroundImage: `url('/image/bg.jpg')`, // Menggunakan jalur relatif ke folder public
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        lineHeight: '1.6',
      }}
    >
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Pseudo-elements dari body di style.css */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-cyan-400 bg-opacity-30 z-0 animate-float" style={{ top: '-150px', left: '-150px', background: 'radial-gradient(circle, rgba(0, 206, 201, 0.3), transparent 70%)' }}></div>
      <div className="absolute w-[400px] h-[400px] rounded-full bg-purple-400 bg-opacity-30 z-0 animate-float2" style={{ bottom: '-150px', right: '-150px', background: 'radial-gradient(circle, rgba(108, 92, 231, 0.3), transparent 70%)' }}></div>

      {/* Navbar - Tetap sticky */}
      <nav className="bg-[#1e3a8a] py-4 shadow-lg sticky top-0 z-[9999] backdrop-filter backdrop-blur-md bg-opacity-70">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="text-white text-3xl font-extrabold tracking-wider select-none">FINPLAYZ Edu Game</div>
          <ul className="flex space-x-2">
            <li>
              <a
                href="#home"
                onClick={() => handleSetCurrentPage('home')}
                className={`text-[#dbeafe] text-lg font-semibold px-4 py-2 rounded-md transition duration-300 ease-in-out
                  ${currentPage === 'home' ? 'text-white underline' : 'hover:text-white hover:font-bold'}`}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#game"
                onClick={() => handleSetCurrentPage('game')}
                className={`text-[#dbeafe] text-lg font-semibold px-4 py-2 rounded-md transition duration-300 ease-in-out
                  ${currentPage === 'game' ? 'text-white underline' : 'hover:text-white hover:font-bold'}`}
              >
                Game Edukatif
              </a>
            </li>
            <li>
              <a
                href="#materi"
                onClick={() => handleSetCurrentPage('materi')}
                className={`text-[#dbeafe] text-lg font-semibold px-4 py-2 rounded-md transition duration-300 ease-in-out
                  ${currentPage === 'materi' ? 'text-white underline' : 'hover:text-white hover:font-bold'}`}
              >
                Materi
              </a>
            </li>
            <li>
              <a
                href="#quiz"
                onClick={() => handleSetCurrentPage('quiz')}
                className={`text-[#dbeafe] text-lg font-semibold px-4 py-2 rounded-md transition duration-300 ease-in-out
                  ${currentPage === 'quiz' ? 'text-white underline' : 'hover:text-white hover:font-bold'}`}
              >
                Kuis
              </a>
            </li>
            <li>
              <a
                href="#about"
                onClick={() => handleSetCurrentPage('about')}
                className={`text-[#dbeafe] text-lg font-semibold px-4 py-2 rounded-md transition duration-300 ease-in-out
                  ${currentPage === 'about' ? 'text-white underline' : 'hover:text-white hover:font-bold'}`}
              >
                Tentang
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Konten Halaman - Pembungkus utama untuk semua halaman yang akan digulir */}
      {/* Mengatur padding-top agar konten dimulai di bawah navbar */}
      {/* Konten halaman akan digulir oleh body HTML utama */}
      <div className="relative z-10 pt-16"> {/* Menggunakan pt-16 (64px) untuk memberi ruang di bawah navbar */}
        {renderPage()}
      </div>

      {/* Tailwind CSS keyframes for float animations */}
      <style>{`
        @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(20px); }
            100% { transform: translateY(0); }
        }

        @keyframes float2 {
            0% { transform: translateX(0); }
            50% { transform: translateX(20px); }
            100% { transform: translateX(0); }
        }
        .animate-float {
            animation: float 10s infinite ease-in-out;
        }
        .animate-float2 {
            animation: float2 12s infinite ease-in-out;
        }

        /* General Button Styles from style.css */
        button {
            padding: 12px 26px;
            margin: 10px 10px 10px 0;
            border: none;
            border-radius: 14px;
            background-color: #6c5ce7; /* Default button color */
            color: white;
            font-weight: 700;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s, box-shadow 0.3s ease;
            box-shadow: 0 4px 14px rgba(108,92,231,0.6);
            user-select: none;
        }

        button:hover {
            background-color: #341f97;
            transform: scale(1.07);
            box-shadow: 0 6px 24px rgba(52,31,151,0.8);
        }

        /* Specific styles for game board cells */
        .owner-p0 { background-color: #f1948a !important; }
        .owner-p1 { background-color: #85c1e9 !important; }

        /* Quiz specific styles */
        .container-quiz {
            background: rgba(30,58,138,0.9);
            color: #fff;
        }
        .quiz-card {
            background-color: #1e3a8a; /* Dark blue from style.css */
        }
        .quiz-card label {
            background-color: rgba(255, 255, 255, 0.1);
            font-weight: 600;
            font-size: 1.1rem;
        }
        .quiz-card label:hover {
            background-color: rgba(255, 255, 255, 0.25);
        }

        /* Result Page specific styles */
        .container-result {
            background: rgba(30,58,138,0.9);
            color: #fff;
        }
        .score-circle {
            background: #00cec9;
            color: #000;
        }
        .result-msg.success { color: #00ff95; }
        .result-msg.warning { color: #ffe066; }
        .result-msg.error { color: #ff6b6b; }
        .feedback {
            background-color: #1e3a8a;
        }
        .feedback .correct { color: #00ff95; }
        .feedback .incorrect { color: #ff6b6b; }

        /* Hero Section specific styles */
        .hero-content h1 {
            font-size: 3.6rem;
            font-weight: 900;
            letter-spacing: 1.5px;
            text-shadow: 0 4px 8px rgba(0,0,0,0.5);
        }
        .hero-content h2 {
            font-size: 2.2rem;
            font-weight: 700;
            color: #fbbf24;
            text-shadow: 0 3px 6px rgba(0,0,0,0.4);
        }
        .hero-content p {
            font-size: 1.25rem;
            line-height: 1.5;
            text-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }
        .btn-hero {
            background-color: #fbbf24;
            color: #1e3a8a;
            padding: 14px 36px;
            font-weight: 700;
            border-radius: 35px;
            font-size: 1.25rem;
            box-shadow: 0 6px 12px rgba(251, 191, 36, 0.6);
        }
        .btn-hero:hover {
            background-color: #f59e0b;
            box-shadow: 0 8px 18px rgba(245, 158, 11, 0.8);
        }

        /* Feature Card specific styles */
        .feature-card {
            background-color: white;
            box-shadow: 0 10px 28px rgba(0,0,0,0.12);
            border-radius: 20px;
            padding: 35px 30px;
            color: #1e3a8a;
        }
        .feature-card:hover {
            transform: translateY(-12px);
            box-shadow: 0 15px 38px rgba(0,0,0,0.18);
        }
        .feature-card h3 {
            color: #1e3a8a;
            font-size: 1.4rem;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .feature-card p {
            font-size: 1.1rem;
            color: #444;
            line-height: 1.5;
        }
        .btn-materi {
            background-color: #3b82f6;
            color: white;
            padding: 12px 28px;
            border-radius: 30px;
            font-weight: 700;
            font-size: 1.1rem;
        }
        .btn-materi:hover {
            background-color: #2563eb;
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.7);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
            .nav-container {
                flex-direction: column;
                gap: 20px;
            }
            .nav-links {
                flex-direction: column;
                gap: 14px;
                align-items: center;
            }
            .hero-content h1 {
                font-size: 2.4rem;
            }
            .hero-content h2 {
                font-size: 1.8rem;
            }
            .features {
                flex-direction: column;
                gap: 40px;
            }
            .feature-card {
                max-width: 100%;
            }
            /* Assuming .item and #character-stats are not directly used in this single file App.js,
               but if they were, their responsive styles would go here. */
        }
      `}</style>
    </div>
  );
}

export default App;
