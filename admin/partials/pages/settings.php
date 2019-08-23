<?php defined( 'ABSPATH' ) || exit; ?>

<div id="su_admin_settings" class="wrap su-admin-settings wp-clearfix">

	<h1><?php $this->the_page_title(); ?></h1>

	<?php settings_errors(); ?>

	<form action="options.php" method="post">

		<?php if ( isset( $_GET['advanced'] ) ) : ?>

			<div class="notice notice-warning">
				<p><strong><?php esc_html_e( 'Warning!', 'shortcodes-ultimate' ); ?></strong> <?php esc_html_e( 'You are editing advanced settings. Be careful and do not edit settings you do not understand', 'shortcodes-ultimate' ); ?>. <a href="<?php echo esc_attr( $this->get_component_url() ); ?>"><?php esc_html_e( 'Return to general settings', 'shortcodes-ultimate' ); ?></a>.</p>
			</div>

			<?php settings_fields( $this->plugin_prefix . 'advanced-settings' ); ?>
			<?php do_settings_sections( $this->plugin_prefix . 'advanced-settings' ); ?>

		<?php else : ?>

			<?php settings_fields( $this->plugin_prefix . 'settings' ); ?>
			<?php do_settings_sections( $this->plugin_prefix . 'settings' ); ?>

		<?php endif; ?>

		<?php submit_button(); ?>

	</form>

	<?php if ( ! isset( $_GET['advanced'] ) ) : ?>
		<p><a href="<?php echo esc_attr( add_query_arg( 'advanced', '', $this->get_component_url() ) ); ?>"><?php esc_html_e( 'Advanced settings', 'shortcodes-ultimate' ); ?></a></p>
	<?php endif; ?>

</div>
