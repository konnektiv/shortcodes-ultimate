<?php

class Shortcodes_Ultimate_Admin_Extra_Shortcodes {

	public function __construct() {}

	public function register_shortcodes() {

		if ( did_action( 'su/extra/ready' ) ) {
			return;
		}

		foreach ( $this->get_shortcodes() as $shortcode ) {

			su_add_shortcode(
				wp_parse_args(
					$shortcode,
					array(
						'group'    => 'extra',
						'image'    => plugin_dir_url( __FILE__ ) . 'images/addons/extra-generator.png',
						'icon'     => plugin_dir_url( __FILE__ ) . 'images/addons/extra-generator.png',
						'callback' => '__return_empty_string',
					)
				)
			);

		}

	}

	private function get_shortcodes() {

		return array(
			array(
				'id'   => 'splash',
				'name' => __( 'Splash screen', 'shortcodes-ultimate' ),
				'desc' => __( 'Fully customizable splash screen', 'shortcodes-ultimate' ),
			),
		);

	}

}
