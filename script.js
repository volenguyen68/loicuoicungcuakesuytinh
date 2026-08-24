// File ghi âm phải nằm cùng thư mục với index.html, script.js và style.css.
const RECORDING_FILE = "./ghi-am.m4a";

new Vue({
  el: "#app",

  data() {
    return {
      audio: null,
      barWidth: "0%",
      duration: "00:00",
      currentTime: "00:00",
      isTimerPlaying: false,
      loadError: "",

      tracks: [
        {
          name: "SCRECRT",
          artist: "Kẻ suy tình",
          source: RECORDING_FILE
        }
      ],

      currentTrack: null,
      currentTrackIndex: 0,
      transitionName: null
    };
  },

  methods: {
    async play() {
      if (!this.audio) return;

      if (this.audio.paused) {
        try {
          this.loadError = "";
          await this.audio.play();
        } catch (error) {
          this.isTimerPlaying = false;
          this.loadError =
            "Không thể phát bản ghi âm. Hãy kiểm tra file ghi-am.m4a.";
        }
      } else {
        this.audio.pause();
      }
    },

    formatTime(value) {
      if (!Number.isFinite(value) || value < 0) {
        return "00:00";
      }

      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60);

      return `${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;
    },

    generateTime() {
      if (!this.audio) return;

      const audioDuration = this.audio.duration;
      const audioCurrentTime = this.audio.currentTime;

      this.duration = this.formatTime(audioDuration);
      this.currentTime = this.formatTime(audioCurrentTime);

      if (Number.isFinite(audioDuration) && audioDuration > 0) {
        const percentage = Math.min(
          100,
          Math.max(0, (audioCurrentTime / audioDuration) * 100)
        );

        this.barWidth = `${percentage}%`;
      }
    },

    clickProgress(event) {
      if (
        !this.audio ||
        !Number.isFinite(this.audio.duration) ||
        this.audio.duration <= 0
      ) {
        return;
      }

      const progressBar = this.$refs.progressBar;
      const bounds = progressBar.getBoundingClientRect();

      const percentage = Math.min(
        100,
        Math.max(
          0,
          ((event.clientX - bounds.left) / bounds.width) * 100
        )
      );

      this.audio.currentTime =
        (this.audio.duration * percentage) / 100;

      this.barWidth = `${percentage}%`;
      this.generateTime();
    }
  },

  created() {
    this.currentTrack = this.tracks[0];

    this.audio = new Audio(this.currentTrack.source);
    this.audio.preload = "metadata";

    this.audio.addEventListener("loadedmetadata", () => {
      this.loadError = "";
      this.generateTime();
    });

    this.audio.addEventListener("timeupdate", () => {
      this.generateTime();
    });

    this.audio.addEventListener("play", () => {
      this.isTimerPlaying = true;
    });

    this.audio.addEventListener("pause", () => {
      this.isTimerPlaying = false;
    });

    this.audio.addEventListener("ended", () => {
      this.isTimerPlaying = false;
      this.audio.currentTime = 0;
      this.barWidth = "0%";
      this.currentTime = "00:00";
    });

    this.audio.addEventListener("error", () => {
      this.isTimerPlaying = false;
      this.loadError =
        "Không tìm thấy ghi-am.m4a. Hãy đặt file ghi âm cùng thư mục với trang web.";
    });

    this.audio.load();
  },

  beforeDestroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute("src");
      this.audio.load();
    }
  }
});