'use strict';

/*!
	Modaal - accessible modals - v0.4.3
	by Humaan, for all humans.
	http://humaan.com
 */
/**
	Modaal jQuery Plugin : Accessible Modals

	==== General Options ===
	type (string) 					: ajax, inline, image, iframe, confirm. Defaults to 'inline'
	content_source (stribg)			: Accepts a string value for your target element, such as '#my-content'. This allows for when trigger element is
										an `<a href="#">` link. Not to be confused with the already existing `source` event.
	animation (string) 				: Fade, expand, down, up. Defaults to 'fade'
	after_callback_delay (integer)	: Specify a delay value for the after open callbacks. This is necessary because with the bundled animations
										have a set duration in the bundled CSS. Specify a delay of the same amount as the animation duration in so
										more accurately fire the after open/close callbacks. Defaults 350, does not apply if animation is 'none',
										after open callbacks are dispatched immediately

	is_locked (boolean)				: Set this to true to disable closing the modal via keypress or clicking the background. Beware that if
										type != 'confirm' there will be no interface to dismiss the modal if is_locked = true, you'd have to
										programmatically arrange to dismiss the modal. Confirm modals are always locked regardless of this option
										Defaults to false

	hide_close (boolean)			: Set this to true to hide the close modal button. Key press and overlay click will still close the modal.
										This method is best used when you want to put a custom close button inside the modal container space.

	background (string)				: Background overlay style. Defaults to '#000'
	overlay_opacity (float) 		: Background overlay transparency. Defaults to 0.8
	overlay_close (boolean)			: Set this to false if you want to disable click to close on overlay background.

	accessible_title (string)		: Accessible title. Default 'Dialog Window'
	start_open (boolean)			: Set this to true to launch the Modaal window immediately on page open
	fullscreen (boolean)			: Set this to true to make the modaal fill the entire screen, false will default to own width/height attributes.
	custom_class (string)			: Fill in this string with a custom class that will be applied to the outer most modal wrapper.

	width (integer)					: Desired width of the modal. Required for iframe type. Defaults to undefined //TODO
	height (integer)				: Desired height of the modal. Required for iframe type. Defaults to undefined //TODO

	background_scroll (boolean)		: Set this to true to enable the page to scroll behind the open modal.

    should_open (boolean|function)  : Boolean or closure that returns a boolean to determine whether to open the modal or not.

	close_text						: String for close button text. Available for localisation and alternative languages to be used.
	close_aria_label				: String for close button aria-label attribute (value that screen readers will read out). Available for localisation and alternative languages to be used.

	=== Events ===
	before_open (function) 			: Callback function executed before modal is opened
	after_open (function)			: Callback function executed after modal is opened
	before_close (function)			: Callback function executed before modal is closed
	after_close (function)			: Callback function executed after modal is closed
	source (function(element, src))	: Callback function executed on the default source, it is intended to transform the
										source (href in an AJAX modal or iframe). The function passes in the triggering element
										as well as the default source depending of the modal type. The default output of the
										function is an untransformed default source.


	=== Confirm Options & Events ===
	confirm_button_text (string)	: Text on the confirm button. Defaults to 'Confirm'
	confirm_cancel_button_text (string) : Text on the confirm modal cancel button. Defaults to 'Cancel'
	confirm_title (string)			: Title for confirm modal. Default 'Confirm Title'
	confirm_content (string)		: HTML content for confirm message
	confirm_callback (function)		: Callback function for when the confirm button is pressed as opposed to cancel
	confirm_cancel_callback (function) : Callback function for when the cancel button is pressed


	=== Gallery Options & Events ===
	gallery_active_class (string)	: Active class applied to the currently active image or image slide in a gallery 'gallery_active_item'
	outer_controls (boolean)		: Set to true to put the next/prev controls outside the Modaal wrapper, at the edges of the browser window.
	before_image_change (function)	: Callback function executed before the image slide changes in a gallery modal. Default function( current_item, incoming_item )
	after_image_change (function)	: Callback function executed after the image slide changes in a gallery modal. Default function ( current_item )


	=== AJAX Options & Events ===
	loading_content (string)		: HTML content for loading message. Default 'Loading &hellip;'
	loading_class (string)			: Class name to be applied while content is loaded via AJAX. Default 'is_loading'
	ajax_error_class (string)		: Class name to be applied when content has failed to load. Default is 'modaal-error'
	ajax_success (function)		 	: Callback for when AJAX content is loaded in


	=== SOCIAL CONTENT ===
	instagram_id (string)			: Unique photo ID for an Instagram photo.

*/
(function ($) {

	var modaal_loading_spinner = '<div class="modaal-loading-spinner"><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div></div>';

	var Modaal = {
		init: function init(options, elem) {
			var self = this;

			self.dom = $('body');

			self.$elem = $(elem);
			self.options = $.extend({}, $.fn.modaal.options, self.$elem.data(), options);
			self.xhr = null;

			// set up the scope
			self.scope = {
				is_open: false,
				id: 'modaal_' + new Date().getTime() + Math.random().toString(16).substring(2),
				source: self.options.content_source ? self.options.content_source : self.$elem.attr('href')
			};

			// add scope attribute to trigger element
			self.$elem.attr('data-modaal-scope', self.scope.id);

			// private options
			self.private_options = {
				active_class: 'is_active'
			};

			self.lastFocus = null;

			// if is_locked
			if (self.options.is_locked || self.options.type == 'confirm' || self.options.hide_close) {
				self.scope.close_btn = '';
			} else {
				self.scope.close_btn = '<button type="button" class="modaal-close" id="modaal-close" aria-label="' + self.options.close_aria_label + '"><span>' + self.options.close_text + '</span></button>';
			}

			// reset animation_speed
			if (self.options.animation === 'none') {
				self.options.animation_speed = 0;
				self.options.after_callback_delay = 0;
			}

			// On click to open modal
			$(elem).on('click.Modaal', function (e) {
				e.preventDefault();
				self.create_modaal(self, e);
			});

			// Define next/prev buttons
			if (self.options.outer_controls === true) {
				var mod_class = 'outer';
			} else {
				var mod_class = 'inner';
			}
			self.scope.prev_btn = '<button type="button" class="modaal-gallery-control modaal-gallery-prev modaal-gallery-prev-' + mod_class + '" id="modaal-gallery-prev" aria-label="Previous image (use left arrow to change)"><span>Previous Image</span></button>';
			self.scope.next_btn = '<button type="button" class="modaal-gallery-control modaal-gallery-next modaal-gallery-next-' + mod_class + '" id="modaal-gallery-next" aria-label="Next image (use right arrow to change)"><span>Next Image</span></button>';

			// Check for start_open
			if (self.options.start_open === true) {
				self.create_modaal(self);
			}
		},

		// Initial create to determine which content type it requires
		// ----------------------------------------------------------------
		create_modaal: function create_modaal(self, e) {
			var self = this;
			var source;

			// Save last active state before modal
			self.lastFocus = self.$elem;

			if (self.options.should_open === false || typeof self.options.should_open === 'function' && self.options.should_open() === false) {
				return;
			}

			// CB: before_open
			self.options.before_open.call(self, e);

			switch (self.options.type) {
				case 'inline':
					self.create_basic();
					break;

				case 'ajax':
					source = self.options.source(self.$elem, self.scope.source);
					self.fetch_ajax(source);
					break;

				case 'confirm':
					self.options.is_locked = true;
					self.create_confirm();
					break;

				case 'image':
					self.create_image();
					break;

				case 'iframe':
					source = self.options.source(self.$elem, self.scope.source);
					self.create_iframe(source);
					break;

				case 'video':
					self.create_video(self.scope.source);
					break;

				case 'instagram':
					self.create_instagram();
					break;
			}

			// call events to be watched (click, tab, keyup, keydown etc.)
			self.watch_events();
		},

		// Watching Modal
		// ----------------------------------------------------------------
		watch_events: function watch_events() {
			var self = this;

			self.dom.off('click.Modaal keyup.Modaal keydown.Modaal');

			// Body keydown
			self.dom.on('keydown.Modaal', function (e) {
				var key = e.keyCode;
				var target = e.target;

				// look for tab change and reset focus to modal window
				// done in keydown so the check fires repeatedly when you hold the tab key down
				if (key == 9 && self.scope.is_open) {
					if (!$.contains(document.getElementById(self.scope.id), target)) {
						$('#' + self.scope.id).find('*[tabindex="0"]').focus();
					}
				}
			});

			// Body keyup
			self.dom.on('keyup.Modaal', function (e) {
				var key = e.keyCode;
				var target = e.target;

				if (e.shiftKey && e.keyCode == 9 && self.scope.is_open) {
					// Watch for shift + tab key press. if open shift focus to close button.
					if (!$.contains(document.getElementById(self.scope.id), target)) {
						$('#' + self.scope.id).find('.modaal-close').focus();
					}
				}

				if (!self.options.is_locked) {
					// On escape key press close modal
					if (key == 27 && self.scope.is_open) {
						if ($(document.activeElement).is('input:not(:checkbox):not(:radio)')) {
							return false;
						}

						self.modaal_close();
						return;
					}
				}

				// is gallery open and images length is > 1
				if (self.options.type == 'image') {
					// arrow left for back
					if (key == 37 && self.scope.is_open && !$('#' + self.scope.id + ' .modaal-gallery-prev').hasClass('is_hidden')) {
						self.gallery_update('prev');
					}
					// arrow right for next
					if (key == 39 && self.scope.is_open && !$('#' + self.scope.id + ' .modaal-gallery-next').hasClass('is_hidden')) {
						self.gallery_update('next');
					}
					return;
				}
			});

			// Body click/touch
			self.dom.on('click.Modaal', function (e) {
				var trigger = $(e.target);

				// General Controls: If it's not locked allow greedy close
				if (!self.options.is_locked) {
					if (self.options.overlay_close && trigger.is('.modaal-inner-wrapper') || trigger.is('.modaal-close') || trigger.closest('.modaal-close').length) {
						self.modaal_close();
						return;
					}
				}

				//Confirm Controls
				if (trigger.is('.modaal-confirm-btn')) {
					// if 'OK' button is clicked, run confirm_callback()
					if (trigger.is('.modaal-ok')) {
						self.options.confirm_callback.call(self, self.lastFocus);
					}

					if (trigger.is('.modaal-cancel')) {
						self.options.confirm_cancel_callback.call(self, self.lastFocus);
					}
					self.modaal_close();
					return;
				}

				// Gallery Controls
				if (trigger.is('.modaal-gallery-control')) {
					// it not active, don't do nuthin!
					if (trigger.hasClass('is_hidden')) {
						return;
					}

					// trigger previous
					if (trigger.is('.modaal-gallery-prev')) {
						self.gallery_update('prev');
					}
					// trigger next
					if (trigger.is('.modaal-gallery-next')) {
						self.gallery_update('next');
					}
					return;
				}
			});
		},

		// Append markup into DOM
		build_modal: function build_modal(content) {
			var self = this;

			// if is instagram
			var igClass = '';
			if (self.options.type == 'instagram') {
				igClass = ' modaal-instagram';
			}

			var wrap_class = self.options.type == 'video' ? 'modaal-video-wrap' : 'modaal-content';

			/*
   	modaal-start_none : fully hidden via display:none;
   	modaal-start_fade : hidden via opacity:0
   	modaal-start_slidedown : ...
   	*/
			var animation_class;
			switch (self.options.animation) {
				case 'fade':
					animation_class = ' modaal-start_fade';
					break;
				case 'slide-down':
					animation_class = ' modaal-start_slidedown';
					break;
				default:
					animation_class = ' modaal-start_none';
			}

			// fullscreen check
			var fullscreen_class = '';
			if (self.options.fullscreen) {
				fullscreen_class = ' modaal-fullscreen';
			}

			// custom class check
			if (self.options.custom_class !== '' || typeof self.options.custom_class !== 'undefined') {
				self.options.custom_class = ' ' + self.options.custom_class;
			}

			// if width and heights exists and is typeof number
			var dimensionsStyle = '';
			if (self.options.width && self.options.height && typeof self.options.width == 'number' && typeof self.options.height == 'number') {
				// if width and height exist, and they are both numbers
				dimensionsStyle = ' style="max-width:' + self.options.width + 'px;height:' + self.options.height + 'px;overflow:auto;"';
			} else if (self.options.width && typeof self.options.width == 'number') {
				// if only width
				dimensionsStyle = ' style="max-width:' + self.options.width + 'px;"';
			} else if (self.options.height && typeof self.options.height == 'number') {
				// if only height
				dimensionsStyle = ' style="height:' + self.options.height + 'px;overflow:auto;"';
			}

			// Reset dimensions style (width and height) for certain types
			if (self.options.type == 'image' || self.options.type == 'video' || self.options.type == 'instagram' || self.options.fullscreen) {
				dimensionsStyle = '';
			}

			// if is touch
			// this is a bug fix for iOS to allow regular click events on div elements.
			var touchTrigger = '';
			if (self.is_touch()) {
				touchTrigger = ' style="cursor:pointer;"';
			}

			var build_markup = '<div class="modaal-wrapper modaal-' + self.options.type + animation_class + igClass + fullscreen_class + self.options.custom_class + '" id="' + self.scope.id + '"><div class="modaal-outer-wrapper"><div class="modaal-inner-wrapper"' + touchTrigger + '>';

			// hide if video
			if (self.options.type != 'video') {
				build_markup += '<div class="modaal-container"' + dimensionsStyle + '>';
			}

			// add the guts of the content
			build_markup += '<div class="' + wrap_class + ' modaal-focus" aria-hidden="false" aria-label="' + self.options.accessible_title + ' - ' + self.options.close_aria_label + '" role="dialog">';

			// If it's inline type, we want to clone content instead of dropping it straight in
			if (self.options.type == 'inline') {
				build_markup += '<div class="modaal-content-container" role="document"></div>';
			} else {
				// Drop in the content if it's not inline
				build_markup += content;
			}

			// close wrap_class
			build_markup += '</div>' + self.scope.close_btn;

			// hide if video
			if (self.options.type != 'video') {
				build_markup += '</div>';
			}

			// close off modaal-inner-wrapper
			build_markup += '</div>';

			// If type is image AND outer_controls is true: add gallery next and previous controls.
			if (self.options.type == 'image' && self.options.outer_controls === true) {
				build_markup += self.scope.prev_btn + self.scope.next_btn;
			}

			// close off modaal-wrapper
			build_markup += '</div></div>';

			// append ajax modal markup to dom
			if ($('#' + self.scope.id + '_overlay').length < 1) {
				self.dom.append(build_markup);
			}

			// if inline, clone content into space
			if (self.options.type == 'inline') {
				content.appendTo('#' + self.scope.id + ' .modaal-content-container');
			}

			// Trigger overlay show (which triggers modal show)
			self.modaal_overlay('show');
		},

		// Create Basic Inline Modal
		// ----------------------------------------------------------------
		create_basic: function create_basic() {
			var self = this;
			var target = $(self.scope.source);
			var content = '';

			if (target.length) {
				content = target.contents().detach();
				target.empty();
			} else {
				content = 'Content could not be loaded. Please check the source and try again.';
			}

			// now push content into markup
			self.build_modal(content);
		},

		// Create Instagram Modal
		// ----------------------------------------------------------------
		create_instagram: function create_instagram() {
			var self = this;
			var id = self.options.instagram_id;
			var content = '';

			var error_msg = 'Instagram photo couldn\'t be loaded, please check the embed code and try again.';

			self.build_modal('<div class="modaal-content-container' + (self.options.loading_class != '' ? ' ' + self.options.loading_class : '') + '">' + self.options.loading_content + '</div>');

			// ID exists, is not empty null or undefined.
			if (id != '' && id !== null && id !== undefined) {
				// set up oembed url
				var ig_url = 'https://api.instagram.com/oembed?url=http://instagr.am/p/' + id + '/';

				$.ajax({
					url: ig_url,
					dataType: "jsonp",
					cache: false,
					success: function success(data) {

						// Create temp dom element from which we'll clone into the modaal instance. This is required to bypass the unusual small thumb issue instagram oembed was serving up
						self.dom.append('<div id="temp-ig" style="width:0;height:0;overflow:hidden;">' + data.html + '</div>');

						// Check if it has loaded once before.
						// This is to stop the Embeds.process from throwing and error the first time it's being loaded.
						// private_options are individual to a modaal_scope so will not work across multiple scopes when checking if true, only that one item.
						if (self.dom.attr('data-igloaded')) {
							window.instgrm.Embeds.process();
						} else {
							// first time it's loaded, let's set a new private option to use next time it's opened.
							self.dom.attr('data-igloaded', 'true');
						}

						// now set location for new content
						// timeout is required as well to bypass the unusual small thumb issue instagram oembed was serving up
						var target = '#' + self.scope.id + ' .modaal-content-container';
						if ($(target).length > 0) {
							setTimeout(function () {
								$('#temp-ig').contents().clone().appendTo(target);
								$('#temp-ig').remove();
							}, 1000);
						}
					},
					error: function error() {
						content = error_msg;

						// now set location for new content
						var target = $('#' + self.scope.id + ' .modaal-content-container');
						if (target.length > 0) {
							target.removeClass(self.options.loading_class).addClass(self.options.ajax_error_class);
							target.html(content);
						}
					}
				});
			} else {
				content = error_msg;
			}

			return false;
		},

		// Fetch Ajax Data
		// ----------------------------------------------------------------
		fetch_ajax: function fetch_ajax(url) {
			var self = this;
			var content = '';

			// If no accessible title, set it to 'Dialog Window'
			if (self.options.accessible_title == null) {
				self.options.accessible_title = 'Dialog Window';
			}

			if (self.xhr !== null) {
				self.xhr.abort();
				self.xhr = null;
			}

			self.build_modal('<div class="modaal-content-container' + (self.options.loading_class != '' ? ' ' + self.options.loading_class : '') + '">' + self.options.loading_content + '</div>');

			self.xhr = $.ajax(url, {
				success: function success(data) {
					// content fetch is successful so push it into markup
					var target = $('#' + self.scope.id).find('.modaal-content-container');
					if (target.length > 0) {
						target.removeClass(self.options.loading_class);
						target.html(data);

						self.options.ajax_success.call(self, target);
					}
				},
				error: function error(xhr) {
					// There were some errors so return an error message
					if (xhr.statusText == 'abort') {
						return;
					}

					var target = $('#' + self.scope.id + ' .modaal-content-container');
					if (target.length > 0) {
						target.removeClass(self.options.loading_class).addClass(self.options.ajax_error_class);
						target.html('Content could not be loaded. Please check the source and try again.');
					}
				}
			});
		},

		// Create Confirm Modal
		// ----------------------------------------------------------------
		create_confirm: function create_confirm() {
			var self = this;
			var content;

			content = '<div class="modaal-content-container">' + '<h1 id="modaal-title">' + self.options.confirm_title + '</h1>' + '<div class="modaal-confirm-content">' + self.options.confirm_content + '</div>' + '<div class="modaal-confirm-wrap">' + '<button type="button" class="modaal-confirm-btn modaal-ok" aria-label="Confirm">' + self.options.confirm_button_text + '</button>' + '<button type="button" class="modaal-confirm-btn modaal-cancel" aria-label="Cancel">' + self.options.confirm_cancel_button_text + '</button>' + '</div>' + '</div>' + '</div>';

			// now push content into markup
			self.build_modal(content);
		},

		// Create Image/Gallery Modal
		// ----------------------------------------------------------------
		create_image: function create_image() {
			var self = this;
			var content;

			var modaal_image_markup = '';
			var gallery_total;

			// If has group attribute
			if (self.$elem.is('[data-group]') || self.$elem.is('[rel]')) {

				// find gallery groups
				var use_group = self.$elem.is('[data-group]');
				var gallery_group = use_group ? self.$elem.attr('data-group') : self.$elem.attr('rel');
				var gallery_group_items = use_group ? $('[data-group="' + gallery_group + '"]') : $('[rel="' + gallery_group + '"]');

				// remove any previous active attribute to any in the group
				gallery_group_items.removeAttr('data-gallery-active', 'is_active');
				// add active attribute to the item clicked
				self.$elem.attr('data-gallery-active', 'is_active');

				// how many in the grouping are there (-1 to connect with each function starting with 0)
				gallery_total = gallery_group_items.length - 1;

				// prepare array for gallery data
				var gallery = [];

				// start preparing markup
				modaal_image_markup = '<div class="modaal-gallery-item-wrap">';

				// loop each grouping item and push it into our gallery array
				gallery_group_items.each(function (i, item) {
					// setup default content
					var img_src = '';
					var img_alt = '';
					var img_description = '';
					var img_active = false;
					var img_src_error = false;

					var data_modaal_desc = item.getAttribute('data-modaal-desc');
					var data_item_active = item.getAttribute('data-gallery-active');

					// if item has inline custom source, use that instead of href. Fall back to href if available.
					if ($(item).attr('data-modaal-content-source')) {
						img_src = $(item).attr('data-modaal-content-source');
					} else if ($(item).attr('href')) {
						img_src = $(item).attr('href');
					} else if ($(item).attr('src')) {
						img_src = $(item).attr('src');
					} else {
						img_src = 'trigger requires href or data-modaal-content-source attribute';
						img_src_error = true;
					}

					// Does it have a modaal description
					if (data_modaal_desc != '' && data_modaal_desc !== null && data_modaal_desc !== undefined) {
						img_alt = data_modaal_desc;
						img_description = '<div class="modaal-gallery-label"><span class="modaal-accessible-hide">Image ' + (i + 1) + ' - </span>' + data_modaal_desc + '</div>';
					} else {
						img_description = '<div class="modaal-gallery-label"><span class="modaal-accessible-hide">Image ' + (i + 1) + '</span></div>';
					}

					// is it the active item
					if (data_item_active) {
						img_active = true;
					}

					// set new object for values we want
					var gallery_item = {
						'url': img_src,
						'alt': img_alt,
						'rawdesc': data_modaal_desc,
						'desc': img_description,
						'active': img_active,
						'src_error': img_src_error
					};

					// push object into gallery array
					gallery.push(gallery_item);
				});

				// now loop through all items in the gallery and build up the markup
				for (var i = 0; i < gallery.length; i++) {
					// Set default active class, then check if array item active is true and update string for class
					var is_active = '';
					var aria_label = gallery[i].rawdesc ? 'Image: ' + gallery[i].rawdesc : 'Image ' + i + ' no description';

					if (gallery[i].active) {
						is_active = ' ' + self.private_options.active_class;
					}

					// if gallery item has source error, output message rather than undefined image
					var image_output = gallery[i].src_error ? gallery[i].url : '<img src="' + gallery[i].url + '" alt=" " style="width:100%">';

					// for each item build up the markup
					modaal_image_markup += '<div class="modaal-gallery-item gallery-item-' + i + is_active + '" aria-label="' + aria_label + '">' + image_output + gallery[i].desc + '</div>';
				}

				// Close off the markup for the gallery
				modaal_image_markup += '</div>';

				// Add next and previous buttons if outside
				if (self.options.outer_controls != true) {
					modaal_image_markup += self.scope.prev_btn + self.scope.next_btn;
				}
			} else {
				// This is only a single gallery item so let's grab the necessary values

				// define the source, check if content_source option exists, and use that or fall back to href.
				var this_img_src;
				var img_src_error = false;
				if (self.$elem.attr('data-modaal-content-source')) {
					this_img_src = self.$elem.attr('data-modaal-content-source');
				} else if (self.$elem.attr('href')) {
					this_img_src = self.$elem.attr('href');
				} else if (self.$elem.attr('src')) {
					this_img_src = self.$elem.attr('src');
				} else {
					this_img_src = 'trigger requires href or data-modaal-content-source attribute';
					img_src_error = true;
				}

				var this_img_alt_txt = '';
				var this_img_alt = '';
				var aria_label = '';

				if (self.$elem.attr('data-modaal-desc')) {
					aria_label = self.$elem.attr('data-modaal-desc');
					this_img_alt_txt = self.$elem.attr('data-modaal-desc');
					this_img_alt = '<div class="modaal-gallery-label"><span class="modaal-accessible-hide">Image - </span>' + this_img_alt_txt + '</div>';
				} else {
					aria_label = "Image with no description";
				}

				// if image item has source error, output message rather than undefined image
				var image_output = img_src_error ? this_img_src : '<img src="' + this_img_src + '" alt=" " style="width:100%">';

				// build up the html
				modaal_image_markup = '<div class="modaal-gallery-item is_active" aria-label="' + aria_label + '">' + image_output + this_img_alt + '</div>';
			}

			// Update content variable
			content = modaal_image_markup;

			// now push content into markup
			self.build_modal(content);

			// setup next & prev buttons
			if ($('.modaal-gallery-item.is_active').is('.gallery-item-0')) {
				$('.modaal-gallery-prev').hide();
			}
			if ($('.modaal-gallery-item.is_active').is('.gallery-item-' + gallery_total)) {
				$('.modaal-gallery-next').hide();
			}
		},

		// Gallery Change Image
		// ----------------------------------------------------------------
		gallery_update: function gallery_update(direction) {
			var self = this;
			var this_gallery = $('#' + self.scope.id);
			var this_gallery_item = this_gallery.find('.modaal-gallery-item');
			var this_gallery_total = this_gallery_item.length - 1;

			// if single item, don't proceed
			if (this_gallery_total == 0) {
				return false;
			}

			var prev_btn = this_gallery.find('.modaal-gallery-prev'),
			    next_btn = this_gallery.find('.modaal-gallery-next');

			var duration = 250;

			var new_img_w = 0,
			    new_img_h = 0;

			// CB: Before image change
			var current_item = this_gallery.find('.modaal-gallery-item.' + self.private_options.active_class),
			    incoming_item = direction == 'next' ? current_item.next('.modaal-gallery-item') : current_item.prev('.modaal-gallery-item');
			self.options.before_image_change.call(self, current_item, incoming_item);

			// stop change if at start of end
			if (direction == 'prev' && this_gallery.find('.gallery-item-0').hasClass('is_active')) {
				return false;
			} else if (direction == 'next' && this_gallery.find('.gallery-item-' + this_gallery_total).hasClass('is_active')) {
				return false;
			}

			// lock dimensions
			current_item.stop().animate({
				opacity: 0
			}, duration, function () {
				// Move to appropriate image
				incoming_item.addClass('is_next').css({
					'position': 'absolute',
					'display': 'block',
					'opacity': 0
				});

				// Collect doc width
				var doc_width = $(document).width();
				var width_threshold = doc_width > 1140 ? 280 : 50;

				// start toggle to 'is_next'
				new_img_w = this_gallery.find('.modaal-gallery-item.is_next').width();
				new_img_h = this_gallery.find('.modaal-gallery-item.is_next').height();

				var new_natural_w = this_gallery.find('.modaal-gallery-item.is_next img').prop('naturalWidth');
				var new_natural_h = this_gallery.find('.modaal-gallery-item.is_next img').prop('naturalHeight');

				// if new image is wider than doc width
				if (new_natural_w > doc_width - width_threshold) {
					// set new width just below doc width
					new_img_w = doc_width - width_threshold;

					// Set temp widths so we can calulate the correct height;
					this_gallery.find('.modaal-gallery-item.is_next').css({ 'width': new_img_w });
					this_gallery.find('.modaal-gallery-item.is_next img').css({ 'width': new_img_w });

					// Set new height variable
					new_img_h = this_gallery.find('.modaal-gallery-item.is_next').find('img').height();
				} else {
					// new img is not wider than screen, so let's set the new dimensions
					new_img_w = new_natural_w;
					new_img_h = new_natural_h;
				}

				// resize gallery region
				this_gallery.find('.modaal-gallery-item-wrap').stop().animate({
					'width': new_img_w,
					'height': new_img_h
				}, duration, function () {
					// hide old active image
					current_item.removeClass(self.private_options.active_class + ' ' + self.options.gallery_active_class).removeAttr('style');
					current_item.find('img').removeAttr('style');

					// show new image
					incoming_item.addClass(self.private_options.active_class + ' ' + self.options.gallery_active_class).removeClass('is_next').css('position', '');

					// animate in new image (now has the normal is_active class
					incoming_item.stop().animate({
						opacity: 1
					}, duration, function () {
						$(this).removeAttr('style').css({
							'width': '100%'
						});
						$(this).find('img').css('width', '100%');

						// remove dimension lock
						this_gallery.find('.modaal-gallery-item-wrap').removeAttr('style');

						// CB: After image change
						self.options.after_image_change.call(self, incoming_item);
					});

					// Focus on the new gallery item
					this_gallery.find('.modaal-gallery-item').removeAttr('tabindex');
					this_gallery.find('.modaal-gallery-item.' + self.private_options.active_class + '').attr('tabindex', '0').focus();

					// hide/show next/prev
					if (this_gallery.find('.modaal-gallery-item.' + self.private_options.active_class).is('.gallery-item-0')) {
						prev_btn.stop().animate({
							opacity: 0
						}, 150, function () {
							$(this).hide();
						});
					} else {
						prev_btn.stop().css({
							'display': 'block',
							'opacity': prev_btn.css('opacity')
						}).animate({
							opacity: 1
						}, 150);
					}
					if (this_gallery.find('.modaal-gallery-item.' + self.private_options.active_class).is('.gallery-item-' + this_gallery_total)) {
						next_btn.stop().animate({
							opacity: 0
						}, 150, function () {
							$(this).hide();
						});
					} else {
						next_btn.stop().css({
							'display': 'block',
							'opacity': prev_btn.css('opacity')
						}).animate({
							opacity: 1
						}, 150);
					}
				});
			});
		},

		// Create Video Modal
		// ----------------------------------------------------------------
		create_video: function create_video(url) {
			var self = this;
			var content;

			// video markup
			content = '<iframe src="' + url + '" class="modaal-video-frame" frameborder="0" allowfullscreen></iframe>';

			// now push content into markup
			self.build_modal('<div class="modaal-video-container">' + content + '</div>');
		},

		// Create iFrame Modal
		// ----------------------------------------------------------------
		create_iframe: function create_iframe(url) {
			var self = this;
			var content;

			if (self.options.width !== null || self.options.width !== undefined || self.options.height !== null || self.options.height !== undefined) {
				// video markup
				content = '<iframe src="' + url + '" class="modaal-iframe-elem" frameborder="0" allowfullscreen></iframe>';
			} else {
				content = '<div class="modaal-content-container">Please specify a width and height for your iframe</div>';
			}

			// now push content into markup
			self.build_modal(content);
		},

		// Open Modaal
		// ----------------------------------------------------------------
		modaal_open: function modaal_open() {
			var self = this;
			var modal_wrapper = $('#' + self.scope.id);
			var animation_type = self.options.animation;

			if (animation_type === 'none') {
				modal_wrapper.removeClass('modaal-start_none');
				self.options.after_open.call(self, modal_wrapper);
			}

			// Open with fade
			if (animation_type === 'fade') {
				modal_wrapper.removeClass('modaal-start_fade');
			}

			// Open with slide down
			if (animation_type === 'slide-down') {
				modal_wrapper.removeClass('modaal-start_slide_down');
			}

			var focusTarget = modal_wrapper;

			// Switch focusTarget tabindex (switch from other modal if exists)
			$('.modaal-wrapper *[tabindex=0]').removeAttr('tabindex');

			if (self.options.type == 'image') {
				focusTarget = $('#' + self.scope.id).find('.modaal-gallery-item.' + self.private_options.active_class);
			} else if (modal_wrapper.find('.modaal-iframe-elem').length) {
				focusTarget = modal_wrapper.find('.modaal-iframe-elem');
			} else if (modal_wrapper.find('.modaal-video-wrap').length) {
				focusTarget = modal_wrapper.find('.modaal-video-wrap');
			} else {
				focusTarget = modal_wrapper.find('.modaal-focus');
			}

			// now set the focus
			focusTarget.attr('tabindex', '0').focus();

			// Run after_open
			if (animation_type !== 'none') {
				// CB: after_open
				setTimeout(function () {
					self.options.after_open.call(self, modal_wrapper);
				}, self.options.after_callback_delay);
			}
		},

		// Close Modal
		// ----------------------------------------------------------------
		modaal_close: function modaal_close() {
			var self = this;
			var modal_wrapper = $('#' + self.scope.id);

			// CB: before_close
			self.options.before_close.call(self, modal_wrapper);

			if (self.xhr !== null) {
				self.xhr.abort();
				self.xhr = null;
			}

			// Now we close the modal
			if (self.options.animation === 'none') {
				modal_wrapper.addClass('modaal-start_none');
			}

			// Close with fade
			if (self.options.animation === 'fade') {
				modal_wrapper.addClass('modaal-start_fade');
			}

			// Close with slide up (using initial slide down)
			if (self.options.animation === 'slide-down') {
				modal_wrapper.addClass('modaal-start_slide_down');
			}

			// CB: after_close and remove
			setTimeout(function () {
				// clone inline content back to origin place
				if (self.options.type == 'inline') {
					$('#' + self.scope.id + ' .modaal-content-container').contents().detach().appendTo(self.scope.source);
				}
				// remove markup from dom
				modal_wrapper.remove();
				// CB: after_close
				self.options.after_close.call(self);
				// scope is now closed
				self.scope.is_open = false;
			}, self.options.after_callback_delay);

			// Call overlay hide
			self.modaal_overlay('hide');

			// Roll back to last focus state before modal open. If was closed programmatically, this might not be set
			if (self.lastFocus != null) {
				self.lastFocus.focus();
			}
		},

		// Overlay control (accepts action for show or hide)
		// ----------------------------------------------------------------
		modaal_overlay: function modaal_overlay(action) {
			var self = this;

			if (action == 'show') {
				// Modal is open so update scope
				self.scope.is_open = true;

				// set body to overflow hidden if background_scroll is false
				if (!self.options.background_scroll) {
					self.dom.addClass('modaal-noscroll');
				}

				// append modaal overlay
				if ($('#' + self.scope.id + '_overlay').length < 1) {
					self.dom.append('<div class="modaal-overlay" id="' + self.scope.id + '_overlay"></div>');
				}

				// now show
				$('#' + self.scope.id + '_overlay').css('background', self.options.background).stop().animate({
					opacity: self.options.overlay_opacity
				}, self.options.animation_speed, function () {
					// now open the modal
					self.modaal_open();
				});
			} else if (action == 'hide') {

				// now hide the overlay
				$('#' + self.scope.id + '_overlay').stop().animate({
					opacity: 0
				}, self.options.animation_speed, function () {
					// remove overlay from dom
					$(this).remove();

					// remove body overflow lock
					self.dom.removeClass('modaal-noscroll');
				});
			}
		},

		// Check if is touch
		// ----------------------------------------------------------------
		is_touch: function is_touch() {
			return 'ontouchstart' in window || navigator.maxTouchPoints;
		}
	};

	// Define default object to store
	var modaal_existing_selectors = [];

	// Declare the modaal jQuery method
	// ------------------------------------------------------------
	$.fn.modaal = function (options) {
		return this.each(function (i) {
			var existing_modaal = $(this).data('modaal');

			if (existing_modaal) {
				// Checking for string value, used for methods
				if (typeof options == 'string') {
					switch (options) {
						case 'open':
							// create the modal
							existing_modaal.create_modaal(existing_modaal);
							break;
						case 'close':
							existing_modaal.modaal_close();
							break;
					}
				}
			} else {
				// Not a string, so let's setup the modal ready to use
				var modaal = Object.create(Modaal);
				modaal.init(options, this);
				$.data(this, "modaal", modaal);

				// push this select into existing selectors array which is referenced during modaal_dom_observer
				modaal_existing_selectors.push({
					'element': $(this).attr('class'),
					'options': options
				});
			}
		});
	};

	// Default options
	// ------------------------------------------------------------
	$.fn.modaal.options = {

		//General
		type: 'inline',
		content_source: null,
		animation: 'fade',
		animation_speed: 300,
		after_callback_delay: 350,
		is_locked: false,
		hide_close: false,
		background: '#000',
		overlay_opacity: '0.8',
		overlay_close: true,
		accessible_title: 'Dialog Window',
		start_open: false,
		fullscreen: false,
		custom_class: '',
		background_scroll: false,
		should_open: true,
		close_text: 'Close',
		close_aria_label: 'Close (Press escape to close)',
		width: null,
		height: null,

		//Events
		before_open: function before_open() {},
		after_open: function after_open() {},
		before_close: function before_close() {},
		after_close: function after_close() {},
		source: function source(element, src) {
			return src;
		},

		//Confirm Modal
		confirm_button_text: 'Confirm', // text on confirm button
		confirm_cancel_button_text: 'Cancel',
		confirm_title: 'Confirm Title', // title for confirm modal
		confirm_content: '<p>This is the default confirm dialog content. Replace me through the options</p>', // html for confirm message
		confirm_callback: function confirm_callback() {},
		confirm_cancel_callback: function confirm_cancel_callback() {},

		//Gallery Modal
		gallery_active_class: 'gallery_active_item',
		outer_controls: false,
		before_image_change: function before_image_change(current_item, incoming_item) {},
		after_image_change: function after_image_change(current_item) {},

		//Ajax Modal
		loading_content: modaal_loading_spinner,
		loading_class: 'is_loading',
		ajax_error_class: 'modaal-error',
		ajax_success: function ajax_success() {},

		//Instagram
		instagram_id: null
	};

	// Check and Set Inline Options
	// ------------------------------------------------------------
	function modaal_inline_options(self) {

		// new empty options
		var options = {};
		var inline_options = false;

		// option: type
		if (self.attr('data-modaal-type')) {
			inline_options = true;
			options.type = self.attr('data-modaal-type');
		}

		// option: type
		if (self.attr('data-modaal-content-source')) {
			inline_options = true;
			options.content_source = self.attr('data-modaal-content-source');
		}

		// option: animation
		if (self.attr('data-modaal-animation')) {
			inline_options = true;
			options.animation = self.attr('data-modaal-animation');
		}

		// option: animation_speed
		if (self.attr('data-modaal-animation-speed')) {
			inline_options = true;
			options.animation_speed = self.attr('data-modaal-animation-speed');
		}

		// option: after_callback_delay
		if (self.attr('data-modaal-after-callback-delay')) {
			inline_options = true;
			options.after_callback_delay = self.attr('data-modaal-after-callback-delay');
		}

		// option: is_locked
		if (self.attr('data-modaal-is-locked')) {
			inline_options = true;
			options.is_locked = self.attr('data-modaal-is-locked') === 'true' ? true : false;
		}

		// option: hide_close
		if (self.attr('data-modaal-hide-close')) {
			inline_options = true;
			options.hide_close = self.attr('data-modaal-hide-close') === 'true' ? true : false;
		}

		// option: background
		if (self.attr('data-modaal-background')) {
			inline_options = true;
			options.background = self.attr('data-modaal-background');
		}

		// option: overlay_opacity
		if (self.attr('data-modaal-overlay-opacity')) {
			inline_options = true;
			options.overlay_opacity = self.attr('data-modaal-overlay-opacity');
		}

		// option: overlay_close
		if (self.attr('data-modaal-overlay-close')) {
			inline_options = true;
			options.overlay_close = self.attr('data-modaal-overlay-close') === 'false' ? false : true;
		}

		// option: accessible_title
		if (self.attr('data-modaal-accessible-title')) {
			inline_options = true;
			options.accessible_title = self.attr('data-modaal-accessible-title');
		}

		// option: start_open
		if (self.attr('data-modaal-start-open')) {
			inline_options = true;
			options.start_open = self.attr('data-modaal-start-open') === 'true' ? true : false;
		}

		// option: fullscreen
		if (self.attr('data-modaal-fullscreen')) {
			inline_options = true;
			options.fullscreen = self.attr('data-modaal-fullscreen') === 'true' ? true : false;
		}

		// option: custom_class
		if (self.attr('data-modaal-custom-class')) {
			inline_options = true;
			options.custom_class = self.attr('data-modaal-custom-class');
		}

		// option: close_text
		if (self.attr('data-modaal-close-text')) {
			inline_options = true;
			options.close_text = self.attr('data-modaal-close-text');
		}

		// option: close_aria_label
		if (self.attr('data-modaal-close-aria-label')) {
			inline_options = true;
			options.close_aria_label = self.attr('data-modaal-close-aria-label');
		}

		// option: background_scroll
		if (self.attr('data-modaal-background-scroll')) {
			inline_options = true;
			options.background_scroll = self.attr('data-modaal-background-scroll') === 'true' ? true : false;
		}

		// option: width
		if (self.attr('data-modaal-width')) {
			inline_options = true;
			options.width = parseInt(self.attr('data-modaal-width'));
		}

		// option: height
		if (self.attr('data-modaal-height')) {
			inline_options = true;
			options.height = parseInt(self.attr('data-modaal-height'));
		}

		// option: confirm_button_text
		if (self.attr('data-modaal-confirm-button-text')) {
			inline_options = true;
			options.confirm_button_text = self.attr('data-modaal-confirm-button-text');
		}

		// option: confirm_cancel_button_text
		if (self.attr('data-modaal-confirm-cancel-button-text')) {
			inline_options = true;
			options.confirm_cancel_button_text = self.attr('data-modaal-confirm-cancel-button-text');
		}

		// option: confirm_title
		if (self.attr('data-modaal-confirm-title')) {
			inline_options = true;
			options.confirm_title = self.attr('data-modaal-confirm-title');
		}

		// option: confirm_content
		if (self.attr('data-modaal-confirm-content')) {
			inline_options = true;
			options.confirm_content = self.attr('data-modaal-confirm-content');
		}

		// option: gallery_active_class
		if (self.attr('data-modaal-gallery-active-class')) {
			inline_options = true;
			options.gallery_active_class = self.attr('data-modaal-gallery-active-class');
		}

		// option: loading_content
		if (self.attr('data-modaal-loading-content')) {
			inline_options = true;
			options.loading_content = self.attr('data-modaal-loading-content');
		}

		// option: loading_class
		if (self.attr('data-modaal-loading-class')) {
			inline_options = true;
			options.loading_class = self.attr('data-modaal-loading-class');
		}

		// option: ajax_error_class
		if (self.attr('data-modaal-ajax-error-class')) {
			inline_options = true;
			options.ajax_error_class = self.attr('data-modaal-ajax-error-class');
		}

		// option: start_open
		if (self.attr('data-modaal-instagram-id')) {
			inline_options = true;
			options.instagram_id = self.attr('data-modaal-instagram-id');
		}

		// now set it up for the trigger, but only if inline_options is true
		if (inline_options) {
			self.modaal(options);
		}
	};

	// On body load (or now, if already loaded), init any modaals defined inline
	// Ensure this is done after $.fn.modaal and default options are declared
	// ----------------------------------------------------------------
	$(function () {

		var single_modaal = $('.modaal');

		// Check for existing modaal elements
		if (single_modaal.length) {
			single_modaal.each(function () {
				var self = $(this);
				modaal_inline_options(self);
			});
		}

		// Obvserve DOM mutations for newly added triggers
		var modaal_dom_observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.addedNodes && mutation.addedNodes.length > 0) {
					// element added to DOM
					var findElement = [].some.call(mutation.addedNodes, function (el) {
						var elm = $(el);
						if (elm.is('a') || elm.is('button')) {

							if (elm.hasClass('modaal')) {
								// is inline Modaal, initialise options
								modaal_inline_options(elm);
							} else {
								// is not inline modaal. Check for existing selector
								modaal_existing_selectors.forEach(function (modaalSelector) {
									if (modaalSelector.element == elm.attr('class')) {
										$(elm).modaal(modaalSelector.options);
										return false;
									}
								});
							}
						}
					});
				}
			});
		});
		var observer_config = {
			subtree: true,
			attributes: true,
			childList: true,
			characterData: true
		};

		// pass in the target node, as well as the observer options
		setTimeout(function () {
			modaal_dom_observer.observe(document.body, observer_config);
		}, 500);
	});
})(jQuery, window, document);
"use strict";

(function () {
	// Tutorial: https://medium.com/@PatrykZabielski/how-to-make-multi-layered-parallax-illustration-with-css-javascript-2b56883c3f27
	window.addEventListener("scroll", function (event) {
		var depth, i, layer, layers, len, movement, topDistance, translate3d;
		topDistance = this.pageYOffset;
		layers = document.querySelectorAll("[data-type='parallax']");
		for (i = 0, len = layers.length; i < len; i++) {
			layer = layers[i];
			depth = layer.getAttribute("data-depth");
			movement = -(topDistance * depth);
			translate3d = "translate3d(0, " + movement + "px, 0)";
			layer.style["-webkit-transform"] = translate3d;
			layer.style["-moz-transform"] = translate3d;
			layer.style["-ms-transform"] = translate3d;
			layer.style["-o-transform"] = translate3d;
			layer.style.transform = translate3d;
		}
	});
}).call(undefined);
"use strict";

// Generated by CoffeeScript 1.9.2

/**
@license Sticky-kit v1.1.2 | WTFPL | Leaf Corcoran 2015 | http://leafo.net
 */

(function ($) {
	$(function () {
		(function () {
			var $, win;

			$ = this.jQuery || window.jQuery;

			win = $(window);

			$.fn.stick_in_parent = function (opts) {
				var doc, elm, enable_bottoming, fn, i, inner_scrolling, len, manual_spacer, offset_top, parent_selector, recalc_every, sticky_class;
				if (opts == null) {
					opts = {};
				}
				sticky_class = opts.sticky_class, inner_scrolling = opts.inner_scrolling, recalc_every = opts.recalc_every, parent_selector = opts.parent, offset_top = opts.offset_top, manual_spacer = opts.spacer, enable_bottoming = opts.bottoming;
				if (offset_top == null) {
					offset_top = 0;
				}
				if (parent_selector == null) {
					parent_selector = void 0;
				}
				if (inner_scrolling == null) {
					inner_scrolling = true;
				}
				if (sticky_class == null) {
					sticky_class = "is_stuck";
				}
				doc = $(document);
				if (enable_bottoming == null) {
					enable_bottoming = true;
				}
				fn = function fn(elm, padding_bottom, parent_top, parent_height, top, height, el_float, detached) {
					var bottomed, _detach, fixed, last_pos, last_scroll_height, offset, parent, recalc, recalc_and_tick, recalc_counter, spacer, tick;
					if (elm.data("sticky_kit")) {
						return;
					}
					elm.data("sticky_kit", true);
					last_scroll_height = doc.height();
					parent = elm.parent();
					if (parent_selector != null) {
						parent = parent.closest(parent_selector);
					}
					if (!parent.length) {
						throw "failed to find stick parent";
					}
					fixed = false;
					bottomed = false;
					spacer = manual_spacer != null ? manual_spacer && elm.closest(manual_spacer) : $("<div />");
					if (spacer) {
						spacer.css("position", elm.css("position"));
					}
					recalc = function recalc() {
						var border_top, padding_top, restore;
						if (detached) {
							return;
						}
						last_scroll_height = doc.height();
						border_top = parseInt(parent.css("border-top-width"), 10);
						padding_top = parseInt(parent.css("padding-top"), 10);
						padding_bottom = parseInt(parent.css("padding-bottom"), 10);
						parent_top = parent.offset().top + border_top + padding_top;
						parent_height = parent.height();
						if (fixed) {
							fixed = false;
							bottomed = false;
							if (manual_spacer == null) {
								elm.insertAfter(spacer);
								spacer.detach();
							}
							elm.css({
								position: "",
								top: "",
								width: "",
								bottom: ""
							}).removeClass(sticky_class);
							restore = true;
						}
						top = elm.offset().top - (parseInt(elm.css("margin-top"), 10) || 0) - offset_top;
						height = elm.outerHeight(true);
						el_float = elm.css("float");
						if (spacer) {
							spacer.css({
								width: elm.outerWidth(true),
								height: height,
								display: elm.css("display"),
								"vertical-align": elm.css("vertical-align"),
								float: el_float
							});
						}
						if (restore) {
							return tick();
						}
					};
					recalc();
					if (height === parent_height) {
						return;
					}
					last_pos = void 0;
					offset = offset_top;
					recalc_counter = recalc_every;
					tick = function tick() {
						var css, delta, recalced, scroll, will_bottom, win_height;
						if (detached) {
							return;
						}
						recalced = false;
						if (recalc_counter != null) {
							recalc_counter -= 1;
							if (recalc_counter <= 0) {
								recalc_counter = recalc_every;
								recalc();
								recalced = true;
							}
						}
						if (!recalced && doc.height() !== last_scroll_height) {
							recalc();
							recalced = true;
						}
						scroll = win.scrollTop();
						if (last_pos != null) {
							delta = scroll - last_pos;
						}
						last_pos = scroll;
						if (fixed) {
							if (enable_bottoming) {
								will_bottom = scroll + height + offset > parent_height + parent_top;
								if (bottomed && !will_bottom) {
									bottomed = false;
									elm.css({
										position: "fixed",
										bottom: "",
										top: offset
									}).trigger("sticky_kit:unbottom");
								}
							}
							if (scroll < top) {
								fixed = false;
								offset = offset_top;
								if (manual_spacer == null) {
									if (el_float === "left" || el_float === "right") {
										elm.insertAfter(spacer);
									}
									spacer.detach();
								}
								css = {
									position: "",
									width: "",
									top: ""
								};
								elm.css(css).removeClass(sticky_class).trigger("sticky_kit:unstick");
							}
							if (inner_scrolling) {
								win_height = win.height();
								if (height + offset_top > win_height) {
									if (!bottomed) {
										offset -= delta;
										offset = Math.max(win_height - height, offset);
										offset = Math.min(offset_top, offset);
										if (fixed) {
											elm.css({
												top: offset + "px"
											});
										}
									}
								}
							}
						} else {
							if (scroll > top) {
								fixed = true;
								css = {
									position: "fixed",
									top: offset
								};
								css.width = elm.css("box-sizing") === "border-box" ? elm.outerWidth() + "px" : elm.width() + "px";
								elm.css(css).addClass(sticky_class);
								if (manual_spacer == null) {
									elm.after(spacer);
									if (el_float === "left" || el_float === "right") {
										spacer.append(elm);
									}
								}
								elm.trigger("sticky_kit:stick");
							}
						}
						if (fixed && enable_bottoming) {
							if (will_bottom == null) {
								will_bottom = scroll + height + offset > parent_height + parent_top;
							}
							if (!bottomed && will_bottom) {
								bottomed = true;
								if (parent.css("position") === "static") {
									parent.css({
										position: "relative"
									});
								}
								return elm.css({
									position: "absolute",
									bottom: padding_bottom,
									top: "auto"
								}).trigger("sticky_kit:bottom");
							}
						}
					};
					recalc_and_tick = function recalc_and_tick() {
						recalc();
						return tick();
					};
					_detach = function detach() {
						detached = true;
						win.off("touchmove", tick);
						win.off("scroll", tick);
						win.off("resize", recalc_and_tick);
						$(document.body).off("sticky_kit:recalc", recalc_and_tick);
						elm.off("sticky_kit:detach", _detach);
						elm.removeData("sticky_kit");
						elm.css({
							position: "",
							bottom: "",
							top: "",
							width: ""
						});
						parent.position("position", "");
						if (fixed) {
							if (manual_spacer == null) {
								if (el_float === "left" || el_float === "right") {
									elm.insertAfter(spacer);
								}
								spacer.remove();
							}
							return elm.removeClass(sticky_class);
						}
					};
					win.on("touchmove", tick);
					win.on("scroll", tick);
					win.on("resize", recalc_and_tick);
					$(document.body).on("sticky_kit:recalc", recalc_and_tick);
					elm.on("sticky_kit:detach", _detach);
					return setTimeout(tick, 0);
				};
				for (i = 0, len = this.length; i < len; i++) {
					elm = this[i];
					fn($(elm));
				}
				return this;
			};
		}).call(this);
	});
})(jQuery);
"use strict";

/*!
Waypoints - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
(function () {
	"use strict";

	var keyCounter = 0;
	var allWaypoints = {};

	/* http://imakewebthings.com/waypoints/api/waypoint */
	function Waypoint(options) {
		if (!options) {
			throw new Error("No options passed to Waypoint constructor");
		}
		if (!options.element) {
			throw new Error("No element option passed to Waypoint constructor");
		}
		if (!options.handler) {
			throw new Error("No handler option passed to Waypoint constructor");
		}

		this.key = "waypoint-" + keyCounter;
		this.options = Waypoint.Adapter.extend({}, Waypoint.defaults, options);
		this.element = this.options.element;
		this.adapter = new Waypoint.Adapter(this.element);
		this.callback = options.handler;
		this.axis = this.options.horizontal ? "horizontal" : "vertical";
		this.enabled = this.options.enabled;
		this.triggerPoint = null;
		this.group = Waypoint.Group.findOrCreate({
			name: this.options.group,
			axis: this.axis
		});
		this.context = Waypoint.Context.findOrCreateByElement(this.options.context);

		if (Waypoint.offsetAliases[this.options.offset]) {
			this.options.offset = Waypoint.offsetAliases[this.options.offset];
		}
		this.group.add(this);
		this.context.add(this);
		allWaypoints[this.key] = this;
		keyCounter += 1;
	}

	/* Private */
	Waypoint.prototype.queueTrigger = function (direction) {
		this.group.queueTrigger(this, direction);
	};

	/* Private */
	Waypoint.prototype.trigger = function (args) {
		if (!this.enabled) {
			return;
		}
		if (this.callback) {
			this.callback.apply(this, args);
		}
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/destroy */
	Waypoint.prototype.destroy = function () {
		this.context.remove(this);
		this.group.remove(this);
		delete allWaypoints[this.key];
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/disable */
	Waypoint.prototype.disable = function () {
		this.enabled = false;
		return this;
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/enable */
	Waypoint.prototype.enable = function () {
		this.context.refresh();
		this.enabled = true;
		return this;
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/next */
	Waypoint.prototype.next = function () {
		return this.group.next(this);
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/previous */
	Waypoint.prototype.previous = function () {
		return this.group.previous(this);
	};

	/* Private */
	Waypoint.invokeAll = function (method) {
		var allWaypointsArray = [];
		for (var waypointKey in allWaypoints) {
			allWaypointsArray.push(allWaypoints[waypointKey]);
		}
		for (var i = 0, end = allWaypointsArray.length; i < end; i++) {
			allWaypointsArray[i][method]();
		}
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/destroy-all */
	Waypoint.destroyAll = function () {
		Waypoint.invokeAll("destroy");
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/disable-all */
	Waypoint.disableAll = function () {
		Waypoint.invokeAll("disable");
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/enable-all */
	Waypoint.enableAll = function () {
		Waypoint.Context.refreshAll();
		for (var waypointKey in allWaypoints) {
			allWaypoints[waypointKey].enabled = true;
		}
		return this;
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/refresh-all */
	Waypoint.refreshAll = function () {
		Waypoint.Context.refreshAll();
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/viewport-height */
	Waypoint.viewportHeight = function () {
		return window.innerHeight || document.documentElement.clientHeight;
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/viewport-width */
	Waypoint.viewportWidth = function () {
		return document.documentElement.clientWidth;
	};

	Waypoint.adapters = [];

	Waypoint.defaults = {
		context: window,
		continuous: true,
		enabled: true,
		group: "default",
		horizontal: false,
		offset: 0
	};

	Waypoint.offsetAliases = {
		"bottom-in-view": function bottomInView() {
			return this.context.innerHeight() - this.adapter.outerHeight();
		},
		"right-in-view": function rightInView() {
			return this.context.innerWidth() - this.adapter.outerWidth();
		}
	};

	window.Waypoint = Waypoint;
})();
(function () {
	"use strict";

	function requestAnimationFrameShim(callback) {
		window.setTimeout(callback, 1000 / 60);
	}

	var keyCounter = 0;
	var contexts = {};
	var Waypoint = window.Waypoint;
	var oldWindowLoad = window.onload;

	/* http://imakewebthings.com/waypoints/api/context */
	function Context(element) {
		this.element = element;
		this.Adapter = Waypoint.Adapter;
		this.adapter = new this.Adapter(element);
		this.key = "waypoint-context-" + keyCounter;
		this.didScroll = false;
		this.didResize = false;
		this.oldScroll = {
			x: this.adapter.scrollLeft(),
			y: this.adapter.scrollTop()
		};
		this.waypoints = {
			vertical: {},
			horizontal: {}
		};

		element.waypointContextKey = this.key;
		contexts[element.waypointContextKey] = this;
		keyCounter += 1;
		if (!Waypoint.windowContext) {
			Waypoint.windowContext = true;
			Waypoint.windowContext = new Context(window);
		}

		this.createThrottledScrollHandler();
		this.createThrottledResizeHandler();
	}

	/* Private */
	Context.prototype.add = function (waypoint) {
		var axis = waypoint.options.horizontal ? "horizontal" : "vertical";
		this.waypoints[axis][waypoint.key] = waypoint;
		this.refresh();
	};

	/* Private */
	Context.prototype.checkEmpty = function () {
		var horizontalEmpty = this.Adapter.isEmptyObject(this.waypoints.horizontal);
		var verticalEmpty = this.Adapter.isEmptyObject(this.waypoints.vertical);
		var isWindow = this.element == this.element.window;
		if (horizontalEmpty && verticalEmpty && !isWindow) {
			this.adapter.off(".waypoints");
			delete contexts[this.key];
		}
	};

	/* Private */
	Context.prototype.createThrottledResizeHandler = function () {
		var self = this;

		function resizeHandler() {
			self.handleResize();
			self.didResize = false;
		}

		this.adapter.on("resize.waypoints", function () {
			if (!self.didResize) {
				self.didResize = true;
				Waypoint.requestAnimationFrame(resizeHandler);
			}
		});
	};

	/* Private */
	Context.prototype.createThrottledScrollHandler = function () {
		var self = this;
		function scrollHandler() {
			self.handleScroll();
			self.didScroll = false;
		}

		this.adapter.on("scroll.waypoints", function () {
			if (!self.didScroll || Waypoint.isTouch) {
				self.didScroll = true;
				Waypoint.requestAnimationFrame(scrollHandler);
			}
		});
	};

	/* Private */
	Context.prototype.handleResize = function () {
		Waypoint.Context.refreshAll();
	};

	/* Private */
	Context.prototype.handleScroll = function () {
		var triggeredGroups = {};
		var axes = {
			horizontal: {
				newScroll: this.adapter.scrollLeft(),
				oldScroll: this.oldScroll.x,
				forward: "right",
				backward: "left"
			},
			vertical: {
				newScroll: this.adapter.scrollTop(),
				oldScroll: this.oldScroll.y,
				forward: "down",
				backward: "up"
			}
		};

		for (var axisKey in axes) {
			var axis = axes[axisKey];
			var isForward = axis.newScroll > axis.oldScroll;
			var direction = isForward ? axis.forward : axis.backward;

			for (var waypointKey in this.waypoints[axisKey]) {
				var waypoint = this.waypoints[axisKey][waypointKey];
				if (waypoint.triggerPoint === null) {
					continue;
				}
				var wasBeforeTriggerPoint = axis.oldScroll < waypoint.triggerPoint;
				var nowAfterTriggerPoint = axis.newScroll >= waypoint.triggerPoint;
				var crossedForward = wasBeforeTriggerPoint && nowAfterTriggerPoint;
				var crossedBackward = !wasBeforeTriggerPoint && !nowAfterTriggerPoint;
				if (crossedForward || crossedBackward) {
					waypoint.queueTrigger(direction);
					triggeredGroups[waypoint.group.id] = waypoint.group;
				}
			}
		}

		for (var groupKey in triggeredGroups) {
			triggeredGroups[groupKey].flushTriggers();
		}

		this.oldScroll = {
			x: axes.horizontal.newScroll,
			y: axes.vertical.newScroll
		};
	};

	/* Private */
	Context.prototype.innerHeight = function () {
		/*eslint-disable eqeqeq */
		if (this.element == this.element.window) {
			return Waypoint.viewportHeight();
		}
		/*eslint-enable eqeqeq */
		return this.adapter.innerHeight();
	};

	/* Private */
	Context.prototype.remove = function (waypoint) {
		delete this.waypoints[waypoint.axis][waypoint.key];
		this.checkEmpty();
	};

	/* Private */
	Context.prototype.innerWidth = function () {
		/*eslint-disable eqeqeq */
		if (this.element == this.element.window) {
			return Waypoint.viewportWidth();
		}
		/*eslint-enable eqeqeq */
		return this.adapter.innerWidth();
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/context-destroy */
	Context.prototype.destroy = function () {
		var allWaypoints = [];
		for (var axis in this.waypoints) {
			for (var waypointKey in this.waypoints[axis]) {
				allWaypoints.push(this.waypoints[axis][waypointKey]);
			}
		}
		for (var i = 0, end = allWaypoints.length; i < end; i++) {
			allWaypoints[i].destroy();
		}
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/context-refresh */
	Context.prototype.refresh = function () {
		/*eslint-disable eqeqeq */
		var isWindow = this.element == this.element.window;
		/*eslint-enable eqeqeq */
		var contextOffset = isWindow ? undefined : this.adapter.offset();
		var triggeredGroups = {};
		var axes;

		this.handleScroll();
		axes = {
			horizontal: {
				contextOffset: isWindow ? 0 : contextOffset.left,
				contextScroll: isWindow ? 0 : this.oldScroll.x,
				contextDimension: this.innerWidth(),
				oldScroll: this.oldScroll.x,
				forward: "right",
				backward: "left",
				offsetProp: "left"
			},
			vertical: {
				contextOffset: isWindow ? 0 : contextOffset.top,
				contextScroll: isWindow ? 0 : this.oldScroll.y,
				contextDimension: this.innerHeight(),
				oldScroll: this.oldScroll.y,
				forward: "down",
				backward: "up",
				offsetProp: "top"
			}
		};

		for (var axisKey in axes) {
			var axis = axes[axisKey];
			for (var waypointKey in this.waypoints[axisKey]) {
				var waypoint = this.waypoints[axisKey][waypointKey];
				var adjustment = waypoint.options.offset;
				var oldTriggerPoint = waypoint.triggerPoint;
				var elementOffset = 0;
				var freshWaypoint = oldTriggerPoint == null;
				var contextModifier, wasBeforeScroll, nowAfterScroll;
				var triggeredBackward, triggeredForward;

				if (waypoint.element !== waypoint.element.window) {
					elementOffset = waypoint.adapter.offset()[axis.offsetProp];
				}

				if (typeof adjustment === "function") {
					adjustment = adjustment.apply(waypoint);
				} else if (typeof adjustment === "string") {
					adjustment = parseFloat(adjustment);
					if (waypoint.options.offset.indexOf("%") > -1) {
						adjustment = Math.ceil(axis.contextDimension * adjustment / 100);
					}
				}

				contextModifier = axis.contextScroll - axis.contextOffset;
				waypoint.triggerPoint = Math.floor(elementOffset + contextModifier - adjustment);
				wasBeforeScroll = oldTriggerPoint < axis.oldScroll;
				nowAfterScroll = waypoint.triggerPoint >= axis.oldScroll;
				triggeredBackward = wasBeforeScroll && nowAfterScroll;
				triggeredForward = !wasBeforeScroll && !nowAfterScroll;

				if (!freshWaypoint && triggeredBackward) {
					waypoint.queueTrigger(axis.backward);
					triggeredGroups[waypoint.group.id] = waypoint.group;
				} else if (!freshWaypoint && triggeredForward) {
					waypoint.queueTrigger(axis.forward);
					triggeredGroups[waypoint.group.id] = waypoint.group;
				} else if (freshWaypoint && axis.oldScroll >= waypoint.triggerPoint) {
					waypoint.queueTrigger(axis.forward);
					triggeredGroups[waypoint.group.id] = waypoint.group;
				}
			}
		}

		Waypoint.requestAnimationFrame(function () {
			for (var groupKey in triggeredGroups) {
				triggeredGroups[groupKey].flushTriggers();
			}
		});

		return this;
	};

	/* Private */
	Context.findOrCreateByElement = function (element) {
		return Context.findByElement(element) || new Context(element);
	};

	/* Private */
	Context.refreshAll = function () {
		for (var contextId in contexts) {
			contexts[contextId].refresh();
		}
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/context-find-by-element */
	Context.findByElement = function (element) {
		return contexts[element.waypointContextKey];
	};

	window.onload = function () {
		if (oldWindowLoad) {
			oldWindowLoad();
		}
		Context.refreshAll();
	};

	Waypoint.requestAnimationFrame = function (callback) {
		var requestFn = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || requestAnimationFrameShim;
		requestFn.call(window, callback);
	};
	Waypoint.Context = Context;
})();
(function () {
	"use strict";

	function byTriggerPoint(a, b) {
		return a.triggerPoint - b.triggerPoint;
	}

	function byReverseTriggerPoint(a, b) {
		return b.triggerPoint - a.triggerPoint;
	}

	var groups = {
		vertical: {},
		horizontal: {}
	};
	var Waypoint = window.Waypoint;

	/* http://imakewebthings.com/waypoints/api/group */
	function Group(options) {
		this.name = options.name;
		this.axis = options.axis;
		this.id = this.name + "-" + this.axis;
		this.waypoints = [];
		this.clearTriggerQueues();
		groups[this.axis][this.name] = this;
	}

	/* Private */
	Group.prototype.add = function (waypoint) {
		this.waypoints.push(waypoint);
	};

	/* Private */
	Group.prototype.clearTriggerQueues = function () {
		this.triggerQueues = {
			up: [],
			down: [],
			left: [],
			right: []
		};
	};

	/* Private */
	Group.prototype.flushTriggers = function () {
		for (var direction in this.triggerQueues) {
			var waypoints = this.triggerQueues[direction];
			var reverse = direction === "up" || direction === "left";
			waypoints.sort(reverse ? byReverseTriggerPoint : byTriggerPoint);
			for (var i = 0, end = waypoints.length; i < end; i += 1) {
				var waypoint = waypoints[i];
				if (waypoint.options.continuous || i === waypoints.length - 1) {
					waypoint.trigger([direction]);
				}
			}
		}
		this.clearTriggerQueues();
	};

	/* Private */
	Group.prototype.next = function (waypoint) {
		this.waypoints.sort(byTriggerPoint);
		var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
		var isLast = index === this.waypoints.length - 1;
		return isLast ? null : this.waypoints[index + 1];
	};

	/* Private */
	Group.prototype.previous = function (waypoint) {
		this.waypoints.sort(byTriggerPoint);
		var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
		return index ? this.waypoints[index - 1] : null;
	};

	/* Private */
	Group.prototype.queueTrigger = function (waypoint, direction) {
		this.triggerQueues[direction].push(waypoint);
	};

	/* Private */
	Group.prototype.remove = function (waypoint) {
		var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
		if (index > -1) {
			this.waypoints.splice(index, 1);
		}
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/first */
	Group.prototype.first = function () {
		return this.waypoints[0];
	};

	/* Public */
	/* http://imakewebthings.com/waypoints/api/last */
	Group.prototype.last = function () {
		return this.waypoints[this.waypoints.length - 1];
	};

	/* Private */
	Group.findOrCreate = function (options) {
		return groups[options.axis][options.name] || new Group(options);
	};

	Waypoint.Group = Group;
})();
(function () {
	"use strict";

	var $ = window.jQuery;
	var Waypoint = window.Waypoint;

	function JQueryAdapter(element) {
		this.$element = $(element);
	}

	$.each(["innerHeight", "innerWidth", "off", "offset", "on", "outerHeight", "outerWidth", "scrollLeft", "scrollTop"], function (i, method) {
		JQueryAdapter.prototype[method] = function () {
			var args = Array.prototype.slice.call(arguments);
			return this.$element[method].apply(this.$element, args);
		};
	});

	$.each(["extend", "inArray", "isEmptyObject"], function (i, method) {
		JQueryAdapter[method] = $[method];
	});

	Waypoint.adapters.push({
		name: "jquery",
		Adapter: JQueryAdapter
	});
	Waypoint.Adapter = JQueryAdapter;
})();
(function () {
	"use strict";

	var Waypoint = window.Waypoint;

	function createExtension(framework) {
		return function () {
			var waypoints = [];
			var overrides = arguments[0];

			if (framework.isFunction(arguments[0])) {
				overrides = framework.extend({}, arguments[1]);
				overrides.handler = arguments[0];
			}

			this.each(function () {
				var options = framework.extend({}, overrides, {
					element: this
				});
				if (typeof options.context === "string") {
					options.context = framework(this).closest(options.context)[0];
				}
				waypoints.push(new Waypoint(options));
			});

			return waypoints;
		};
	}

	if (window.jQuery) {
		window.jQuery.fn.waypoint = createExtension(window.jQuery);
	}
	if (window.Zepto) {
		window.Zepto.fn.waypoint = createExtension(window.Zepto);
	}
})();