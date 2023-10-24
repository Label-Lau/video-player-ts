import styles from "./video.module.css";

interface IVideo {
  url: string;
  elem: string | HTMLElement;
  width?: string;
  height?: string;
  autoplay?: boolean;
}

interface IComponent {
  tempContainer: HTMLElement;
  init: () => void;
  template: () => void;
  handle: () => void;
}

function video(options: IVideo) {
  return new Video(options);
}

class Video implements IComponent {
  tempContainer: HTMLElement;
  constructor(private settings: IVideo) {
    this.settings = Object.assign(
      {
        width: "100%",
        height: "100%",
        autoplay: false,
      },
      this.settings
    );
    this.init();
  }
  init() {
    this.template();
    this.handle();
  }
  template() {
    this.tempContainer = document.createElement("div");
    this.tempContainer.className = styles.video;
    this.tempContainer.style.width = this.settings.width;
    this.tempContainer.style.height = this.settings.height;
    this.tempContainer.innerHTML = `
    <video class="${styles["video-content"]}" src="${this.settings.url}"></video>
    <div class="${styles["video-controls"]}">
      <div class="${styles["video-progress"]}">
        <div class="${styles["video-progress-now"]}"></div>
        <div class="${styles["video-progress-suc"]}"></div>
        <div class="${styles["video-progress-bar"]}"></div>
      </div>
      <div class="${styles["video-play"]}">
        <i class="iconfont icon-bofang"></i>
      </div>
      <div class="${styles["video-time"]}">
        <span>00:00</span> / <span>00:00</span>
      </div>
      <div class="${styles["video-full"]}">
        <i class="iconfont icon-quanpingzuidahua"></i>
      </div>
      <div class="${styles["video-volume"]}">
        <i class="iconfont icon-51yinliang"></i>
        <div class="${styles["video-volprogress"]}">
          <div class="${styles["video-volprogress-now"]}"></div>
          <div class="${styles["video-volprogress-bar"]}"></div>
        </div>
      </div>
    </div>
    `;
    if (typeof this.settings.elem === "object") {
      this.settings.elem.appendChild(this.tempContainer);
    } else {
      document
        .querySelector(this.settings.elem)
        .appendChild(this.tempContainer);
    }
  }
  handle() {
    let videoContent: HTMLVideoElement = this.tempContainer.querySelector(
      `.${styles["video-content"]}`
    );
    let videoControls: HTMLDivElement = this.tempContainer.querySelector(
      `.${styles["video-controls"]}`
    );
    let videoPlay = this.tempContainer.querySelector(
      `.${styles["video-controls"]} i`
    );
    let videoTime = this.tempContainer.querySelectorAll(
      `.${styles["video-time"]} span`
    );
    let videoFull = this.tempContainer.querySelector(
      `.${styles["video-full"]}`
    );
    let videoProgress: NodeListOf<HTMLElement> =
      this.tempContainer.querySelectorAll(`.${styles["video-progress"]} div`);
    let videoVolProgress: NodeListOf<HTMLElement> =
      this.tempContainer.querySelectorAll(
        `.${styles["video-volprogress"]} div`
      );
    let timer: number;

    videoContent.volume = 0.5;

    if (this.settings.autoplay) {
      videoContent.play();
      timer = setInterval(playing, 1000);
    }

    this.tempContainer.addEventListener("mouseenter", function () {
      videoControls.style.bottom = "0";
    });
    this.tempContainer.addEventListener("mouseleave", function () {
      videoControls.style.bottom = "-50px";
    });
    // 视频是否加载完毕
    videoContent.addEventListener("canplay", () => {
      console.log("canplay");
      videoTime[1].innerHTML = formatTime(videoContent.duration);
    });
    // 视频播放事件
    videoContent.addEventListener("play", () => {
      console.log("play");
      videoPlay.className = "iconfont icon-zanting";
      timer = setInterval(playing, 1000);
    });
    // 视频暂停事件
    videoContent.addEventListener("pause", () => {
      console.log("pause");
      videoPlay.className = "iconfont icon-bofang";
      timer && clearInterval(timer);
    });

    videoPlay.addEventListener("click", () => {
      if (videoContent.paused) {
        videoContent.play();
      } else {
        videoContent.pause();
      }
    });

    videoFull.addEventListener("click", () => {
      videoContent.requestFullscreen();
    });
    videoProgress[2].addEventListener(
      "mousedown",
      function (event: MouseEvent) {
        let downX = event.pageX; //   距离浏览器左侧的距离
        let downL = this.offsetLeft; // 距离父容器左侧的距离
        console.log(downX, downL);
        console.log(this.parentNode);

        document.onmousemove = (event: MouseEvent) => {
          const moveLength = event.pageX - downX; // 鼠标在 x 轴移动的距离
          console.log(moveLength);
          // 鼠标在 x 轴移动的距离 + 距离父容器左侧的距离 / 父容器宽度
          let scale =
            (moveLength + downL + 8) /
            (this.parentNode as HTMLElement).offsetWidth;
          console.log(scale);
          if (scale < 0) {
            scale = 0;
          } else if (scale > 1) {
            scale = 1;
          }
          videoProgress[0].style.width = scale * 100 + "%";
          videoProgress[1].style.width = scale * 100 + "%";
          this.style.left = scale * 100 + "%";
          videoContent.currentTime = scale * videoContent.duration;
        };
        document.onmouseup = () => {
          document.onmousemove = null;
        };
      }
    );

    videoVolProgress[1].addEventListener(
      "mousedown",
      function (event: MouseEvent) {
        let downX = event.pageX; //   距离浏览器左侧的距离
        let downL = this.offsetLeft; // 距离父容器左侧的距离
        document.onmousemove = (event: MouseEvent) => {
          const moveLength = event.pageX - downX; // 鼠标在 x 轴移动的距离
          // 鼠标在 x 轴移动的距离 + 距离父容器左侧的距离 / 父容器宽度
          let scale =
            (moveLength + downL + 8) /
            (this.parentNode as HTMLElement).offsetWidth;
          if (scale < 0) {
            scale = 0;
          } else if (scale > 1) {
            scale = 1;
          }
          videoVolProgress[0].style.width = scale * 100 + "%";
          this.style.left = scale * 100 + "%";
          videoContent.volume = scale;
        };
        document.onmouseup = () => {
          document.onmousemove = null;
        };
      }
    );

    function playing() {
      const scale = videoContent.currentTime / videoContent.duration;
      let scaleSuc = videoContent.buffered.end(0) / videoContent.duration;
      videoTime[0].innerHTML = formatTime(videoContent.currentTime);

      videoProgress[0].style.width = scale * 100 + "%";
      videoProgress[1].style.width = scaleSuc * 100 + "%";
      videoProgress[2].style.left = scale * 100 + "%";
    }

    function formatTime(time: number): string {
      const timer = Math.round(time);
      let min = Math.floor(timer / 60) + "";
      min = min.length === 1 ? "0" + min : min;
      let sec = (timer % 60) + "";
      sec = sec.length === 1 ? "0" + sec : sec;
      return min + ":" + sec;
    }
  }
}

export default video;
