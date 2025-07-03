window.Pageboard.InfiniteScroll = class {
	constructor(node) {
		this.node = node;
		this.page = 0;
		this.observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				this.visible = this.node.offsetParent && (entry.intersectionRatio || 0) !== 0;
				this.fetch();
			});
		}, {
			threshold: [0, 1]
		});
	}
	fetch() {
		if (!this.queue) return;
		this.queue = this.queue.then(() => {
			if (this.visible && this.active) return this.load(this.page).then(stop => {
				if (stop) return;
				this.page += 1;
				return this.waitRepaint().then(() => {
					if (this.visible) this.fetch();
				});
			});
		});
	}
	waitRepaint() {
		const d = Promise.withResolvers();
		setTimeout(d.resolve, 250);
		return d.promise;
	}
	start() {
		this.active = true;
		this.page = 0;
		this.queue = Promise.resolve();
		this.observer.observe(this.node);
		this.node.classList.toggle('active', true);
	}
	stop() {
		this.active = false;
		delete this.queue;
		this.observer.unobserve(this.node);
		this.node.classList.toggle('active', false);
	}
	destroy() {
		this.stop();
		this.observer.disconnect();
		delete this.observer;
	}
};
