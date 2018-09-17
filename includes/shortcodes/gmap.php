<?php

su_add_shortcode( array(
		'id' => 'gmap',
		'callback' => 'su_shortcode_gmap',
		'image' => su_get_plugin_url() . 'admin/images/shortcodes/gmap.svg',
		'name' => __( 'Google map', 'shortcodes-ultimate' ),
		'type' => 'single',
		'group' => 'media',
		'atts' => array(
			'width' => array(
				'type' => 'slider',
				'min' => 200,
				'max' => 1600,
				'step' => 20,
				'default' => 600,
				'name' => __( 'Width', 'shortcodes-ultimate' ),
				'desc' => __( 'Map width', 'shortcodes-ultimate' )
			),
			'height' => array(
				'type' => 'slider',
				'min' => 200,
				'max' => 1600,
				'step' => 20,
				'default' => 400,
				'name' => __( 'Height', 'shortcodes-ultimate' ),
				'desc' => __( 'Map height', 'shortcodes-ultimate' )
			),
			'responsive' => array(
				'type' => 'bool',
				'default' => 'yes',
				'name' => __( 'Responsive', 'shortcodes-ultimate' ),
				'desc' => __( 'Ignore width and height parameters and make map responsive', 'shortcodes-ultimate' )
			),
			'address' => array(
				'values' => array( ),
				'default' => '',
				'name' => __( 'Marker', 'shortcodes-ultimate' ),
				'desc' => __( 'Address for the marker. You can type it in any language', 'shortcodes-ultimate' )
			),
			'class' => array(
				'type' => 'extra_css_class',
				'name' => __( 'Extra CSS class', 'shortcodes-ultimate' ),
				'desc' => __( 'Additional CSS class name(s) separated by space(s)', 'shortcodes-ultimate' ),
				'default' => '',
			),
		),
		'desc' => __( 'Maps by Google', 'shortcodes-ultimate' ),
		'icon' => 'globe',
	) );

function su_shortcode_gmap( $atts = null, $content = null ) {
	$atts = shortcode_atts( array(
			'width'      => 600,
			'height'     => 400,
			'responsive' => 'yes',
			'address'    => 'New York',
			'class'      => ''
		), $atts, 'gmap' );
	su_query_asset( 'css', 'su-shortcodes' );
	return '<div class="su-gmap su-responsive-media-' . $atts['responsive'] . su_get_css_class( $atts ) . '"><iframe width="' . $atts['width'] . '" height="' . $atts['height'] . '" src="//maps.google.com/maps?q=' . urlencode( su_do_attribute( $atts['address'] ) ) . '&amp;output=embed"></iframe></div>';
}
