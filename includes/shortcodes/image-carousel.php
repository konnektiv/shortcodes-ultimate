<?php

su_add_shortcode(
	array(
		'id'       => 'image_carousel',
		'callback' => 'su_shortcode_image_carousel',
		'image'    => su_get_plugin_url() . 'admin/images/shortcodes/image_carousel.svg',
		'name'     => __( 'Image carousel', 'shortcodes-ultimate' ),
		'type'     => 'single',
		'group'    => 'gallery',
		'atts'     => array(
			'class' => array(
				'type'    => 'extra_css_class',
				'name'    => __( 'Extra CSS class', 'shortcodes-ultimate' ),
				'desc'    => __( 'Additional CSS class name(s) separated by space(s)', 'shortcodes-ultimate' ),
				'default' => '',
			),
		),
		'content'  => __( 'Box content', 'shortcodes-ultimate' ),
		'desc'     => __( 'Colored box with caption', 'shortcodes-ultimate' ),
		'icon'     => 'list-alt',
	)
);

function su_shortcode_image_carousel( $atts = null, $content = null ) {

	$atts = shortcode_atts(
		array(
			'class' => '',
		),
		$atts,
		'image_carousel'
	);

	su_query_asset( 'js', 'flickity' );
	su_query_asset( 'css', 'flickity' );
	su_query_asset( 'css', 'su-shortcodes' );

	// Return result
	return sprintf(
		'<div class="su-image-carousel" class="%s">image_carousel</div>',
		su_get_css_class( $atts )
	);

}
