console.clear();

const { gsap, imagesLoaded } = window;

function initMarqueeText() {
	const marquees = document.querySelectorAll(".marquee");
	marquees.forEach((marquee) => {
		const itemEls = marquee.querySelectorAll(".item");
		itemEls.forEach((itemEl) => {
			const word = itemEl.getAttribute("data-word");
			const number = itemEl.getAttribute("data-number");
			for (let i = 0; i < word.length; i++) {
				const letterEl = document.createElement("span");
				letterEl.className = "letter";
				letterEl.innerHTML = word[i];
				itemEl.appendChild(letterEl);
			}
			const numberEl = document.createElement("span");
			numberEl.classList.add("number", "letter");
			numberEl.innerHTML = `<p>${number}</p><p>X</p>`;
			itemEl.appendChild(numberEl);
		});
	});
}

initMarqueeText();

class Cursor {
	constructor(hoverItems) {
		this.hoverItems = hoverItems;
		this.initCursor();
		this.initHovers();
		this.initBounds();
	}

	initCursor() {
		this.outerCursor = document.querySelector(".cursor--large");
		this.innerCursor = document.querySelector(".cursor--small");
		this.outerCursorBox = this.outerCursor.getBoundingClientRect();
		this.innerCursorBox = this.innerCursor.getBoundingClientRect();
		this.outerCursorSpeed = 0.2;
		this.clientX = -100;
		this.clientY = -100;

		document.addEventListener("mousemove", (e) => {
			this.clientX = e.clientX;
			this.clientY = e.clientY;
		});

		const render = () => {
			gsap.set(this.innerCursor, {
				x: this.clientX - this.innerCursorBox.width / 2,
				y: this.clientY - this.innerCursorBox.height / 2,
			});
			if (!this.isStuck) {
				gsap.to(this.outerCursor, this.outerCursorSpeed, {
					x: this.clientX - this.outerCursorBox.width / 2,
					y: this.clientY - this.outerCursorBox.height / 2,
				});
			}

			requestAnimationFrame(render);
		};
		render();
	}

	initHovers() {
		const handleMouseEnter = (e) => {
			this.isStuck = true;
			const target = e.currentTarget;
			const box = target.getBoundingClientRect();
			this.outerCursorOriginals = {
				width: this.outerCursorBox.width,
				height: this.outerCursorBox.height,
			};
			gsap.to(this.innerCursor, this.outerCursorSpeed, {
				scale: 2,
			});
			gsap.to(this.outerCursor, this.outerCursorSpeed, {
				x: box.left,
				y: box.top,
				width: box.width,
				height: box.width,
				opacity: 0.8,
			});
		};

		const handleMouseLeave = () => {
			this.isStuck = false;
			gsap.to(this.innerCursor, this.outerCursorSpeed, {
				scale: 1,
			});
			gsap.to(this.outerCursor, this.outerCursorSpeed, {
				width: this.outerCursorOriginals.width,
				height: this.outerCursorOriginals.width,
				opacity: 0.5,
			});
		};
		this.hoverItems.forEach((item) => {
			item.addEventListener("mouseenter", handleMouseEnter);
			item.addEventListener("mouseleave", handleMouseLeave);
		});
	}

	initClick() {
		gsap.set(this.innerCursor, { scale: 1 });

		const handleMouseDown = () => {
			gsap.to(this.innerCursor, this.outerCursorSpeed, {
				scale: 3,
			});
		};

		const handleMouseUp = () => {
			gsap.to(this.innerCursor, this.outerCursorSpeed, {
				scale: this.originalScale || 1,
			});
		};

		// TODO: NEED TO GET THE LAST SCALE VALUE
		// Is there a better way getting the last scale value ?

		// 	const update = () => {
		// 	let scale = this.innerCursor.style.getPropertyValue("transform").match(/\(([^)]+)\)/g);
		// 	scale = scale[scale.length - 1].replace(/[\])}[{(]/g, "");
		// 	if (scale.length <= 1) {
		// 		this.originalScale = scale;
		// 		console.log(this.originalScale);
		// 	}
		// 	requestAnimationFrame(update);
		// };
		// update();

		document.body.addEventListener("mousedown", handleMouseDown);
		document.body.addEventListener("mouseup", handleMouseUp);
	}

	initBounds() {
		const onMouseEnter = () => {
			this.outerCursor.classList.remove("hide");
			gsap.to(this.innerCursor, this.outerCursorSpeed, {
				scale: 1,
				opacity: 1,
			});
			gsap.to(this.outerCursor, this.outerCursorSpeed, {
				scale: 1,
				opacity: 1,
			});
		};

		const onMouseLeave = () => {
			this.outerCursor.classList.add("hide");
			gsap.to(this.innerCursor, this.outerCursorSpeed, {
				scale: 0,
				opacity: 0,
			});
			gsap.to(this.outerCursor, this.outerCursorSpeed, {
				scale: 2,
				opacity: 0,
			});
		};

		document.body.addEventListener("mouseenter", onMouseEnter);
		document.body.addEventListener("mouseleave", onMouseLeave);
	}
}

class Slider {
	constructor() {
		this.transitionSlide = document.querySelector(".transition-slide");
		this.setRandomColor();
	}

	initSlider() {
		this.slides = document.querySelectorAll(".slides__wrapper .slide");
		this.totalSlides = this.slides.length;
		this.currentSlideIndex = 0;
		this.currentSlide = this.slides[this.currentSlideIndex];
		this.currentSlideImage = this.currentSlide.querySelector("img");
		this.currentSlide.classList.add("active");

		this.marquees = document.querySelectorAll(".marquee");
		this.activeMarquee = this.marquees[this.currentSlideIndex];
		this.activeMarquee.classList.add("active");
		this.showMarquee = true;

		this.outerCursor = document.querySelector(".cursor--large");
		this.innerCursor = document.querySelector(".cursor--small");

		gsap.fromTo(
			this.currentSlideImage,
			{
				scale: 1.4,
			},
			{
				duration: 1.5,
				scale: 1,
			}
		);

		this.initProgress();
		this.initSlideButtons();
		this.initHovers();
	}

	initSlideButtons() {
		this.nextButton = document.querySelector(".btn.next");
		this.prevButton = document.querySelector(".btn.prev");

		gsap.fromTo(
			[this.prevButton, this.nextButton],
			{
				opacity: 0,
				translateY: "10%",
				rotate: "20deg",
				transformOrigin: "left bottom",
				pointerEvents: "none",
			},
			{
				delay: 0.4,
				duration: 0.4,
				opacity: 1,
				rotate: "0deg",
				translateY: "0%",
				pointerEvents: "all",
			}
		);

		const incrementSlide = (val) => {
			if (val > 0 && this.currentSlideIndex + val < this.slides.length) {
				this.currentSlideIndex += val;
			} else if (val > 0) {
				this.currentSlideIndex = 0;
			} else if (val < 0 && this.currentSlideIndex + val < 0) {
				this.currentSlideIndex = this.slides.length - 1;
			} else {
				this.currentSlideIndex += val;
			}
		};

		const handleSlide = (direction) => {
			let increment;
			if (direction === "next") increment = 1;
			if (direction === "previous") increment = -1;

			incrementSlide(increment);

			this.currentSlide = this.slides[this.currentSlideIndex];
			this.currentSlideImage = this.currentSlide.querySelector("img");
			this.activeMarquee = this.marquees[this.currentSlideIndex];
			this.prevSlideIndex =
				this.currentSlideIndex - 1 < 0
				? this.slides.length - 1
			: this.currentSlideIndex - 1;
			this.prevSlideImage = this.slides[this.prevSlideIndex].querySelector("img");

			this.updateProgress();
			this.animateSlide(direction, () => {
				this.showMarquee = true;
				for (let i = 0; i < this.slides.length; i++) {
					this.slides[i].classList.remove("active");
				}
				for (let i = 0; i < this.marquees.length; i++) {
					this.marquees[i].classList.remove("active");
				}
				this.currentSlide.classList.add("active");
				this.activeMarquee.classList.add("active");
			});
		};

		this.nextButton.addEventListener("click", () => handleSlide("next"));
		this.prevButton.addEventListener("click", () => handleSlide("previous"));
	}

	setRandomColor() {
		const randomDeg = Math.random() * this.currentSlideIndex;
		this.randomBg = `hsl(${randomDeg * 360}, 15%, 45%)`;
		this.randomColor = `hsl(${randomDeg * 360}, 50%, 70%)`;
		gsap.set(this.transitionSlide, {
			scaleX: 0,
			backgroundColor: this.randomBg,
		});
		gsap.set(this.activeMarquee, { color: this.randomColor });
	}

	animateSlide(direction, fn) {
		const slideTransitionDuration = 0.4;
		const slideTransitionDelay = 0.8;

		this.showMarquee = false;

		this.setRandomColor();

		gsap.set(this.prevButton, { pointerEvents: "none" });
		gsap.set(this.nextButton, { pointerEvents: "none" });
		gsap.set(this.currentSlideImage, {
			scale: 1.4,
		});

		let tl = gsap.timeline();
		tl.to(this.prevSlideImage, {
			scale: 1.4,
		});

		if (direction === "next") {
			tl.to(
				this.nextButton,
				{
					opacity: 0.5,
				},
				"-="
			)
				.to(
				this.transitionSlide,
				{
					duration: slideTransitionDuration,
					transformOrigin: "right",
					scaleX: 1,
				},
				"-="
			)
				.call(fn)
				.to(this.transitionSlide, {
				delay: slideTransitionDelay,
				duration: slideTransitionDuration,
				scaleX: 0,
				transformOrigin: "left",
			})
				.to(this.nextButton, {
				opacity: 1,
			});
		} else if (direction === "previous") {
			tl.to(
				this.prevButton,
				{
					opacity: 0.5,
				},
				"-="
			)
				.to(
				this.transitionSlide,
				{
					duration: slideTransitionDuration,
					transformOrigin: "left",
					scaleX: 1,
				},
				"-="
			)
				.call(fn)
				.to(this.transitionSlide, {
				delay: 1,
				duration: slideTransitionDuration,
				scaleX: 0,
				transformOrigin: "right",
			})
				.to(this.prevButton, {
				opacity: 1,
			});
		}

		tl.set(this.prevButton, { pointerEvents: "all" })
			.set(this.nextButton, {
			pointerEvents: "all",
		})
			.to(
			this.currentSlideImage,
			{
				duration: slideTransitionDuration,
				scale: 1,
			},
			`-=${slideTransitionDuration * 2}`
		);
	}

	initProgress() {
		this.currentSlideTextEl = document.querySelector(".current-slide");
		const progressBarContainer = document.querySelector(".slider__progress--container ");
		const progressContainer = document.querySelector(".progress");
		this.progressBar = document.querySelector(".progress span");

		let tl = gsap.timeline();

		tl.fromTo(
			progressBarContainer,
			{
				opacity: 0,
				translateY: "15%",
			},
			{
				delay: 1,
				duration: 0.5,
				opacity: 1,
				translateY: "0%",
			}
		)
			.fromTo(
			progressContainer,
			{
				scaleX: 0,
				transformOrigin: "right",
			},
			{
				duration: 0.5,
				scaleX: 1,
				transformOrigin: "left",
			},
			"-=0.4"
		)
			.call(() => {
			this.updateProgress();
		});
	}

	updateProgress() {
		const progress = (this.currentSlideIndex + 1) / this.totalSlides;
		gsap.to(this.progressBar, {
			duration: 0.4,
			scaleX: progress,
			ease: "power2",
		});
		gsap.timeline()
			.to(this.currentSlideTextEl, 0.2, { opacity: 0 })
			.call(() => {
			this.currentSlideTextEl.innerHTML = `0${this.currentSlideIndex + 1}`;
		})
			.to(this.currentSlideTextEl, 0.2, { opacity: 1 });
	}

	initHovers() {
		const sliderWrapper = document.querySelector(".slides__wrapper");
		let mouseInside = false;

		const handleMouseEnter = () => {
			if (this.showMarquee) {
				gsap.set(".marquee.active .letter", {
					translateY: "100%",
					opacity: 0,
				});

				let tl = gsap.timeline();

				tl.to(".slider__wrapper", {
					opacity: 0.45,
				})
					.to(
					this.currentSlideImage,
					{
						delay: 0.1,
						duration: 0.5,
						scale: 1.15,
						filter: "grayscale(0.8)",
					},
					"-="
				)
					.to(
					".marquee.active .item .letter",
					{
						duration: 0.4,
						translateY: "0%",
						opacity: 1,
						stagger: 0.04,
					},
					"-="
				);

				gsap.to(this.outerCursor, {
					scale: 2,
					opacity: 0,
				});
				gsap.to(this.innerCursor, {
					scale: 4,
				});
			}
		};

		const handleMouseLeave = () => {
			if (this.showMarquee) {
				let tl = gsap.timeline();

				tl.to(
					this.currentSlideImage,
					{
						duration: 0.5,
						scale: 1,
						filter: "grayscale(0)",
					},
					"-="
				);

				gsap.to(this.outerCursor, {
					scale: 1,
					opacity: 1,
				});
				gsap.to(this.innerCursor, {
					scale: 1,
				});
			}
		};

		const render = () => {
			if (this.showMarquee && mouseInside) {
				// he
			} else if (!this.showMarquee || !mouseInside) {
				gsap.to(".marquee.active .letter", {
					duration: 0.5,
					translateY: "100%",
					opacity: 0,
				});
				gsap.to(".slider__wrapper", {
					opacity: 1,
				});
			}
			requestAnimationFrame(render);
		};
		render();

		sliderWrapper.addEventListener("mouseover", () => {
			mouseInside = true;
			handleMouseEnter();
		});

		sliderWrapper.addEventListener("mouseleave", () => {
			mouseInside = false;
			handleMouseLeave();
		});
	}
}

const buttonContainers = document.querySelectorAll(".slider__btn--container");

const cursor = new Cursor(buttonContainers);
const slider = new Slider();

const waitForImages = () => {
	const images = [...document.querySelectorAll("img")];
	const totalImages = images.length;
	let loadedImages = 0;
	const loaderEl = document.querySelector(".loader span");

	images.forEach((image) => {
		imagesLoaded(image, (instance) => {
			if (instance.isComplete) {
				loadedImages++;
				let loadProgress = loadedImages / totalImages;

				gsap.to(loaderEl, {
					duration: 1,
					scaleX: loadProgress,
					backgroundColor: `hsl(${loadProgress * 120}, 100%, 50%`,
				});

				if (totalImages == loadedImages) loadSlider();
			}
		});
	});
};

waitForImages();

function loadSlider() {
	gsap.set(slider.transitionSlide, {
		scaleX: 0,
		backgroundColor: "#fff",
	});
	let tl = gsap.timeline();
	tl.to(".loading__wrapper", {
		delay: 1.5,
		duration: 0.35,
		opacity: 0,
		pointerEvents: "none",
	})
		.to(slider.transitionSlide, {
		delay: 1,
		duration: 0.4,
		transformOrigin: "right",
		scaleX: 1,
	})
		.call(() => {
		slider.initSlider();
	})
		.to(slider.transitionSlide, {
		delay: 0.6,
		duration: 0.4,
		scaleX: 0,
		transformOrigin: "left",
	})
		.call(() => {
		slider.setRandomColor();
	});
}