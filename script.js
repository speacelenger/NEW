document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ヘッダーのスクロール処理 ---
    const header = document.querySelector('header');
    const scrollThreshold = 50; 

    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 2. Color Galleryの音楽再生処理 ---
    
    // HTMLのクラス名と一致していることを確認（.gallery-item-clean）
    const galleryItems = document.querySelectorAll('.gallery-item-clean');
    
    let currentPlayingAudio = null; // 現在再生中の <audio> 要素を追跡
    let currentPlayingItem = null;  // 現在再生中のアイテム <div> 要素を追跡

    galleryItems.forEach(item => {
        // 必須要素を取得。もしこれらがHTML内に無ければ再生機能は動作しない
        const audio = item.querySelector('.gallery-audio-player');
        const btn = item.querySelector('.play-pause-btn');
        const progressBarContainer = item.querySelector('.progress-bar-container');
        const progressBar = item.querySelector('.progress-bar');
        const timeDisplay = item.querySelector('.time-display');
        
        // ギャラリーアイテムにUI要素がない場合は処理をスキップ
        if (!audio || !btn || !progressBarContainer || !timeDisplay) {
            // UIが未完成のアイテムはコンソールに警告を出す
            console.warn("Skipping gallery item due to missing audio or UI elements:", item);
            return;
        }

        // 初期化
        timeDisplay.textContent = '0:00 / 0:00';

        // メディアのメタデータが読み込まれたとき
        audio.addEventListener('loadedmetadata', () => {
            const duration = formatTime(audio.duration);
            timeDisplay.textContent = `0:00 / ${duration}`;
        });

        // -------------------------
        // A. 再生/一時停止ボタンの処理
        // -------------------------
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // 親要素（アイテム全体）のクリックを無効化

            if (audio.paused || audio.ended) {
                // 他の音楽を停止する
                if (currentPlayingAudio && currentPlayingAudio !== audio) {
                    currentPlayingAudio.pause();
                    const prevBtn = currentPlayingItem.querySelector('.play-pause-btn');
                    prevBtn.innerHTML = '<i class="fas fa-play"></i>';
                    currentPlayingItem.classList.remove('is-playing');
                }

                // 再生開始
                audio.play()
                    .then(() => {
                        btn.innerHTML = '<i class="fas fa-pause"></i>';
                        item.classList.add('is-playing');
                        currentPlayingAudio = audio;
                        currentPlayingItem = item;
                    })
                    .catch(error => {
                        console.error("Audio playback failed:", error);
                        // ブラウザの自動再生ブロックなどで失敗した場合
                    });
            } else {
                // 一時停止
                audio.pause();
                btn.innerHTML = '<i class="fas fa-play"></i>';
                item.classList.remove('is-playing');
                currentPlayingAudio = null;
                currentPlayingItem = null;
            }
        });

        // -------------------------
        // B. 進捗バーの更新とクリックシーク
        // -------------------------
        audio.addEventListener('timeupdate', () => {
            if (isNaN(audio.duration)) return; // durationがNaNの場合はスキップ

            const percentage = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = percentage + '%';
            
            const currentTime = formatTime(audio.currentTime);
            const duration = formatTime(audio.duration);
            timeDisplay.textContent = `${currentTime} / ${duration}`;
        });

        // 再生が終了したときの処理
        audio.addEventListener('ended', () => {
            btn.innerHTML = '<i class="fas fa-play"></i>';
            item.classList.remove('is-playing');
            currentPlayingAudio = null;
            currentPlayingItem = null;
            progressBar.style.width = '0%';
        });
        
        // 進捗バーをクリックしてシーク（再生位置の変更）
        progressBarContainer.addEventListener('click', (e) => {
            const width = progressBarContainer.clientWidth;
            // 相対的なクリック位置を計算
            const clickX = e.offsetX; 
            const duration = audio.duration;

            if (!isNaN(duration)) {
                audio.currentTime = (clickX / width) * duration;
            }
        });
    });
    
    // 時間を MM:SS 形式に整形するヘルパー関数
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // 他のナビゲーション/スクロール処理は、上記の処理に含まれています。
});