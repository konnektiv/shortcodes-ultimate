jQuery(document).ready(function($) {
	var self = {};

	self.MFPItems = {};

	self.l10n = su_magnific_popup;

	self.initGalleries = function() {
		var galleries = document.querySelectorAll(
			'.su-image-carousel-has-lightbox'
		);

		galleries.forEach(function(gallery, galleryIndex) {
			gallery.addEventListener('click', self.onGalleryClick);

			var items = gallery.querySelectorAll(
				'.su-image-carousel-item-content > a'
			);

			self.MFPItems[galleryIndex] = [];

			items.forEach(function(item, itemIndex) {
				item.setAttribute('data-gallery', galleryIndex);
				item.setAttribute('data-index', itemIndex);

				self.MFPItems[galleryIndex].push({
					src: item.getAttribute('href'),
					title: item.getAttribute('data-caption')
				});
			});
		});
	};

	self.onGalleryClick = function(e) {
		var clickedLink = self.closest(e.target, function(el) {
			return el.tagName && el.tagName.toUpperCase() === 'A';
		});

		if (!clickedLink) {
			return;
		}

		e.preventDefault();

		var galleryIndex = parseInt(clickedLink.getAttribute('data-gallery'), 10);
		var itemIndex = parseInt(clickedLink.getAttribute('data-index'), 10);

		self.openMagnificPopup(galleryIndex, itemIndex);
	};

	self.openMagnificPopup = function(galleryIndex, itemIndex) {
		$.magnificPopup.open(
			{
				items: self.MFPItems[galleryIndex],
				type: 'image',
				mainClass: 'mfp-img-mobile su-image-carousel-mfp',
				gallery: {
					enabled: true,
					navigateByImgClick: true,
					preload: [1, 1],
					tPrev: self.l10n.prev,
					tNext: self.l10n.next,
					tCounter: self.l10n.counter
				},
				tClose: self.l10n.close,
				tLoading: self.l10n.loading
			},
			itemIndex
		);
	};

	self.closest = function closest(el, fn) {
		return el && (fn(el) ? el : self.closest(el.parentNode, fn));
	};

	self.initGalleries();
});
