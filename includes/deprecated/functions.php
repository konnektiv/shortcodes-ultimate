<?php

/**
 * Deprecated functions.
 */

/**
 * Extra CSS class helper.
 *
 * @deprecated 5.0.5    Replaced with more clear name su_get_css_class().
 * @param array   $atts Shortcode attributes.
 * @return string       String with CSS class name(s).
 */
function su_ecssc( $atts ) {
	return su_get_css_class( $atts );
}