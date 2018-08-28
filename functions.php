<?php

/**
 * Add browser as class to body
 */
require(get_stylesheet_directory() . '/inc/Browser.php');
function pwd_browser_detect( $classes ) {
	$browser = new Browser();
	$detected = $browser->getBrowser();
	$class = str_replace(' ', '_', strtolower($detected));
	$classes[] = $class;
	return $classes;
}
add_filter( 'body_class', 'pwd_browser_detect' );

/**
 * Activate theme options
 */
require(get_stylesheet_directory() . '/inc/options.php');
add_action('customize_register', 'themeCustomizer::customizer_settings');
add_action('acf/init', 'pwdThemeOptions::pwd_options_pages');
add_action('acf/init', 'pwdThemeOptions::pwd_google_analytics');
add_action('acf/init', 'pwdThemeOptions::pwd_google_map_fields');

/**
 * Enqueue Scripts
 */
function pwd_child_enqueue_scripts()
{
	if (is_rtl()) {
		wp_enqueue_style('generatepress-rtl', trailingslashit(get_template_directory_uri()) . 'rtl.css');
	}
	wp_enqueue_style('project', get_stylesheet_directory_uri() . '/assets/css/style.css');
	wp_enqueue_script('jquery');
	wp_enqueue_script('vendor', get_stylesheet_directory_uri() . '/assets/js/vendors.js');
	wp_enqueue_script('custom', get_stylesheet_directory_uri() . '/assets/js/custom.min.js');
}
add_action('wp_enqueue_scripts', 'pwd_child_enqueue_scripts', 100);

/**
 * Google Analytics
 */
function pwd_ga_head_code()
{
	$code = get_field('pwd_head_code', 'option');
	return $code;
}
add_action('wp_head', 'pwd_ga_head_code');
function pwd_ga_body_code()
{
	$code = get_field('pwd_body_code', 'option');
	return $code;
}
add_action('generate_before_header', 'pwd_ga_body_code');
function pwd_ga_footer_code()
{
	$code = get_field('pwd_footer_code', 'option');
	return $code;
}
add_action('wp_footer', 'pwd_ga_footer_code');

/**
 * Shortcodes
 */
// social profiles
function pwd_social_shortcode()
{
	$facebook_url = get_theme_mod('facebook');
	$twitter_url = get_theme_mod('twitter');
	$instagram_url = get_theme_mod('instagram');
	$youtube_url = get_theme_mod('youtube');
	$linkedin_url = get_theme_mod('linkedin');
	$pinterest_url = get_theme_mod('pinterest');
	$google_url = get_theme_mod('google');
	$facebook = get_theme_mod('facebook');
	$facebook_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/></svg>';
	$twitter = get_theme_mod('twitter');
	$twitter_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z"/></svg>';
	$instagram = get_theme_mod('instagram');
	$instagram_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14.829 6.302c-.738-.034-.96-.04-2.829-.04s-2.09.007-2.828.04c-1.899.087-2.783.986-2.87 2.87-.033.738-.041.959-.041 2.828s.008 2.09.041 2.829c.087 1.879.967 2.783 2.87 2.87.737.033.959.041 2.828.041 1.87 0 2.091-.007 2.829-.041 1.899-.086 2.782-.988 2.87-2.87.033-.738.04-.96.04-2.829s-.007-2.09-.04-2.828c-.088-1.883-.973-2.783-2.87-2.87zm-2.829 9.293c-1.985 0-3.595-1.609-3.595-3.595 0-1.985 1.61-3.594 3.595-3.594s3.595 1.609 3.595 3.594c0 1.985-1.61 3.595-3.595 3.595zm3.737-6.491c-.464 0-.84-.376-.84-.84 0-.464.376-.84.84-.84.464 0 .84.376.84.84 0 .463-.376.84-.84.84zm-1.404 2.896c0 1.289-1.045 2.333-2.333 2.333s-2.333-1.044-2.333-2.333c0-1.289 1.045-2.333 2.333-2.333s2.333 1.044 2.333 2.333zm-2.333-12c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.958 14.886c-.115 2.545-1.532 3.955-4.071 4.072-.747.034-.986.042-2.887.042s-2.139-.008-2.886-.042c-2.544-.117-3.955-1.529-4.072-4.072-.034-.746-.042-.985-.042-2.886 0-1.901.008-2.139.042-2.886.117-2.544 1.529-3.955 4.072-4.071.747-.035.985-.043 2.886-.043s2.14.008 2.887.043c2.545.117 3.957 1.532 4.071 4.071.034.747.042.985.042 2.886 0 1.901-.008 2.14-.042 2.886z"/></svg>';
	$youtube = get_theme_mod('youtube');
	$youtube_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10.918 13.933h.706v3.795h-.706v-.419c-.13.154-.266.272-.405.353-.381.218-.902.213-.902-.557v-3.172h.705v2.909c0 .153.037.256.188.256.138 0 .329-.176.415-.284v-2.881zm.642-4.181c.2 0 .311-.16.311-.377v-1.854c0-.223-.098-.38-.324-.38-.208 0-.309.161-.309.38v1.854c-.001.21.117.377.322.377zm-1.941 2.831h-2.439v.747h.823v4.398h.795v-4.398h.821v-.747zm4.721 2.253v2.105c0 .47-.176.834-.645.834-.259 0-.474-.094-.671-.34v.292h-.712v-5.145h.712v1.656c.16-.194.375-.354.628-.354.517.001.688.437.688.952zm-.727.043c0-.128-.024-.225-.075-.292-.086-.113-.244-.125-.367-.062l-.146.116v2.365l.167.134c.115.058.283.062.361-.039.04-.054.061-.141.061-.262v-1.96zm10.387-2.879c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-10.746-2.251c0 .394.12.712.519.712.224 0 .534-.117.855-.498v.44h.741v-3.986h-.741v3.025c-.09.113-.291.299-.436.299-.159 0-.197-.108-.197-.269v-3.055h-.741v3.332zm-2.779-2.294v1.954c0 .703.367 1.068 1.085 1.068.597 0 1.065-.399 1.065-1.068v-1.954c0-.624-.465-1.071-1.065-1.071-.652 0-1.085.432-1.085 1.071zm-2.761-2.455l.993 3.211v2.191h.835v-2.191l.971-3.211h-.848l-.535 2.16-.575-2.16h-.841zm10.119 10.208c-.013-2.605-.204-3.602-1.848-3.714-1.518-.104-6.455-.103-7.971 0-1.642.112-1.835 1.104-1.848 3.714.013 2.606.204 3.602 1.848 3.715 1.516.103 6.453.103 7.971 0 1.643-.113 1.835-1.104 1.848-3.715zm-.885-.255v.966h-1.35v.716c0 .285.024.531.308.531.298 0 .315-.2.315-.531v-.264h.727v.285c0 .731-.313 1.174-1.057 1.174-.676 0-1.019-.491-1.019-1.174v-1.704c0-.659.435-1.116 1.071-1.116.678.001 1.005.431 1.005 1.117zm-.726-.007c0-.256-.054-.445-.309-.445-.261 0-.314.184-.314.445v.385h.623v-.385z"/></svg>';
	$linkedin = get_theme_mod('linkedin');
	$linkedin_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z"/></svg>';
	$pinterest = get_theme_mod('pinterest');
	$pinterest_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 19c-.721 0-1.418-.109-2.073-.312.286-.465.713-1.227.87-1.835l.437-1.664c.229.436.895.804 1.604.804 2.111 0 3.633-1.941 3.633-4.354 0-2.312-1.888-4.042-4.316-4.042-3.021 0-4.625 2.027-4.625 4.235 0 1.027.547 2.305 1.422 2.712.132.062.203.034.234-.094l.193-.793c.017-.071.009-.132-.049-.202-.288-.35-.521-.995-.521-1.597 0-1.544 1.169-3.038 3.161-3.038 1.72 0 2.924 1.172 2.924 2.848 0 1.894-.957 3.205-2.201 3.205-.687 0-1.201-.568-1.036-1.265.197-.833.58-1.73.58-2.331 0-.537-.288-.986-.886-.986-.702 0-1.268.727-1.268 1.7 0 .621.211 1.04.211 1.04s-.694 2.934-.821 3.479c-.142.605-.086 1.454-.025 2.008-2.603-1.02-4.448-3.553-4.448-6.518 0-3.866 3.135-7 7-7s7 3.134 7 7-3.135 7-7 7z"/></svg>';
	$google = get_theme_mod('google');
	$google_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.917 16.083c-2.258 0-4.083-1.825-4.083-4.083s1.825-4.083 4.083-4.083c1.103 0 2.024.402 2.735 1.067l-1.107 1.068c-.304-.292-.834-.63-1.628-.63-1.394 0-2.531 1.155-2.531 2.579 0 1.424 1.138 2.579 2.531 2.579 1.616 0 2.224-1.162 2.316-1.762h-2.316v-1.4h3.855c.036.204.064.408.064.677.001 2.332-1.563 3.988-3.919 3.988zm9.917-3.5h-1.75v1.75h-1.167v-1.75h-1.75v-1.166h1.75v-1.75h1.167v1.75h1.75v1.166z"/></svg>';

	$html = '<ul class="social-media row">';
	if ($facebook_url) {
		$html .= '<li class="facebook">';
		$html .= '<a href="' . $facebook_url . '">';
		$html .= $facebook_icon;
		$html .= '</a>';
		$html .= '</li>';
	}
	if ($twitter_url) {
		$html .= '<li class="twitter">';
		$html .= '<a href="' . $twitter_url . '">';
		$html .= $twitter_icon;
		$html .= '</a>';
		$html .= '</li>';
	}
	if ($instagram_url) {
		$html .= '<li class="instagram">';
		$html .= '<a href="' . $instagram_url . '">';
		$html .= $instagram_icon;
		$html .= '</a>';
		$html .= '</li>';
	}
	if ($youtube_url) {
		$html .= '<li class="youtube">';
		$html .= '<a href="' . $youtube_url . '">';
		$html .= $youtube_icon;
		$html .= '</a>';
		$html .= '</li>';
	}
	if ($linkedin_url) {
		$html .= '<li class="linkedin">';
		$html .= '<a href="' . $linkedin_url . '">';
		$html .= $linkedin_icon;
		$html .= '</a>';
		$html .= '</li>';
	}
	if ($pinterest_url) {
		$html .= '<li class="pinterest">';
		$html .= '<a href="' . $pinterest_url . '">';
		$html .= $pinterest_icon;
		$html .= '</a>';
		$html .= '</li>';
	}
	if ($google_url) {
		$html .= '<li class="google">';
		$html .= '<a href="' . $google_url . '">';
		$html .= $google_icon;
		$html .= '</a>';
		$html .= '</li>';
	}
	$html .= '</ul>';

	return $html;

}
add_shortcode('social', 'pwd_social_shortcode');

// phone number
function pwd_phone_shortcode()
{
	$phone = get_theme_mod('phone_number');
	$phone_link = preg_replace('/\s+/', '', $phone);
	$content .= '<a class="tel-link" href="' . $phone_link . '">';
		$content .= $phone;
	$content .= '</a>';
	return $content;
}
add_shortcode('phone', 'pwd_phone_shortcode');

// email
function pwd_email_shortcode()
{
	$email = get_theme_mod('email_address');
	$content .= '<a class="email-link" href=mailto:"' . $email . '">';
	$content .= $email;
	$content .= '</a>';
	return $content;
}
add_shortcode('email', 'pwd_email_shortcode');

// map
function pwd_google_map_shortcode() {
	$marker = get_field('google_map_marker_svg', 'option');
	$fill = get_field('google_map_marker_fill_colour', 'option');
	$scale = get_field('google_map_marker_scale', 'option');
	$zoom = get_field('google_maps_zoom_level', 'option' );
	$snazzy = get_field('snazzy_maps_style', 'option');
	$lat = get_field('default_lat', 'option');
	$long = get_field('default_long', 'option');
	$image = get_field('map_marker_image', 'option');
	$image_scale = get_field('marker_image_scale', 'option');
	$image_anchor = get_field('marker_image_anchor_point', 'option');
	$marker_type = get_field('marker_style', 'option');
	if ( $marker_type ) {
		$marker_result = 'icon';
	} else {
		$marker_result = 'image';
	}
	if ( $snazzy ) {
		$map_style = $snazzy;
	} else {
		$map_style = '[
			{
				"featureType": "administrative.country",
				"elementType": "geometry.fill",
				"stylers": [
					{
						"saturation": "-35"
					}
				]
			}
		]';
	}
	$map_id = uniqid('map_');
	$api = get_field( 'google_maps_api', 'option' );

	$map = '<div id="' . $map_id . '" class="google-map" style="height:100%;width:100%;"></div>';

	$map .= '<script>';
	$map .= 'function init' . $map_id . '() {
				var map = new google.maps.Map(document.getElementById("' . $map_id . '"), {
					center: {lat: ' . $lat . ', lng: ' . $long . '},
					zoom: ' . $zoom . ',
					scrollwheel: false,
					navigationControl: false,
					mapTypeControl: false,
					scaleControl: false,
					draggable: false
				});

				var icon = {
					path: "' . $image . '",
					fillColor: "' . $fill . '",
					fillOpacity: 1,
					scale: ' . $scale . ',
					strokeColor: "' . $fill . '",
					strokeWeight: 1
				};
				
				var image = {
					url: "' . $image . '",
					scaledSize: new google.maps.Size( ' . $image_scale . ' ),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point( ' . $image_anchor . ')
				};
				position = new google.maps.LatLng(' . $lat . ',' . $long . ')
				var marker = new google.maps.Marker({
				position: position,
				icon: ' . $marker_result . ',
				map: map
				});

				map.setOptions({
					styles: ' . $map_style . '
				});
			}';
	$map .= '</script>';
	$map .= '<script src="https://maps.googleapis.com/maps/api/js?key=' . $api . '&callback=init' . $map_id . '" async defer></script>';

	// Return output
	return $map;
}
add_shortcode( 'map', 'pwd_google_map_shortcode' );

/**
 * Function to check if page slug exists
 */
function pwd_the_slug_exists($post_name)
{
	global $wpdb;
	if ($wpdb->get_row("SELECT post_name FROM wp_posts WHERE post_name = '" . $post_name . "'", 'ARRAY_A')) {
		return true;
	} else {
		return false;
	}
}