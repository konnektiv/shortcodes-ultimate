<?php defined( 'ABSPATH' ) or exit; ?>

<?php
$addons = $this->get_installed_addons();
$this->the_licenses_notices();
?>

<div class="notice notice-info">
	<p><?php _e( 'Need help?', 'shortcodes-ultimate' ); ?> <a href="http://docs.getshortcodes.com/article/58-how-to-activate-license-key" target="_blank"><?php _e( 'How to activate license key', 'shortcodes-ultimate' ); ?></a>.</p>
</div>

<div id="su_admin_licenses" class="su-admin-licenses wp-clearfix">

	<?php if ( !count( $addons ) ) : // No installed add-ons ?>

		<div class="su-admin-licenses-not-found">
			<h3 class="wp-ui-text-highlight"><?php _e( 'No installed add-ons', 'shortcodes-ultimate' ); ?></h3>
			<p><?php _e( 'See help tab at the top right corner of this page for more information.', 'shortcodes-ultimate' ); ?></p>
			<p><a href="<?php echo $this->get_tab_url( 'addons' ); ?>"><?php _e( 'View available add-ons', 'shortcodes-ultimate' ); ?></a></p>
		</div>

	<?php endif; ?>

	<?php foreach ( $addons as $addon ) : ?>

		<?php $license = $this->get_license( $addon['id'] ); ?>

		<?php if ( $license ) : // Active license ?>

			<div class="su-admin-licenses-item su-admin-licenses-item-activated">
				<img src="<?php echo $this->get_plugin_url(); ?>admin/images/addons/<?php echo esc_attr( $addon['id'] ); ?>.png" class="su-admin-licenses-item-image">
				<div class="su-admin-licenses-item-info">
					<div class="su-admin-licenses-item-title"><?php echo $addon['title']; ?></div>
					<form action="<?php echo admin_url( 'admin-post.php' ); ?>" method="post">
						<div class="su-admin-licenses-item-key">
							<label for="su_admin_license_key_<?php echo sanitize_title( $addon['id'] ); ?>">
								<?php _e( 'License key', 'shortcodes-ultimate' ); ?>:
								<?php if ( $license['expires'] === 'lifetime' or strtotime( $license['expires'] ) > time() ) : ?>
									<span><?php _e( 'Active', 'shortcodes-ultimate' ); ?></span>
								<?php else : ?>
									<span class="expired"><?php _e( 'Expired', 'shortcodes-ultimate' ); ?></span>
								<?php endif; ?>
							</label>
							<input type="text" name="license_key" id="su_admin_license_key_<?php echo sanitize_title( $addon['id'] ); ?>" class="widefat" value="<?php echo esc_attr( $license['key'] ); ?>">
						</div>
						<div class="su-admin-licenses-item-expires"><?php _e( 'Expires', 'shortcodes-ultimate' ); ?>: <?php echo $this->get_license_expiration_date( $addon['id'] ); ?></div>
						<div class="su-admin-licenses-item-submit">
							<?php submit_button( __( 'Deactivate', 'shortcodes-ultimate' ), 'button', 'submit', false ); ?>
						</div>
						<input type="hidden" name="action" value="su_deactivate_license">
						<input type="hidden" name="name" value="<?php echo $addon['remote_name']; ?>">
						<input type="hidden" name="id" value="<?php echo $addon['id']; ?>">
						<?php wp_nonce_field( 'su_deactivate_license', 'nonce' ); ?>
					</form>
				</div>
			</div>

		<?php else : // Inactive license ?>

			<div class="su-admin-licenses-item">
				<img src="<?php echo $this->get_plugin_url(); ?>admin/images/addons/<?php echo esc_attr( $addon['id'] ); ?>.png" class="su-admin-licenses-item-image">
				<div class="su-admin-licenses-item-info">
					<div class="su-admin-licenses-item-title"><?php echo $addon['title']; ?></div>
					<form action="<?php echo admin_url( 'admin-post.php' ); ?>" method="post">
						<div class="su-admin-licenses-item-key">
							<label for="su_admin_license_key_<?php echo sanitize_title( $addon['id'] ); ?>"><?php _e( 'License key', 'shortcodes-ultimate' ); ?></label>
							<input type="text" name="license_key" id="su_admin_license_key_<?php echo sanitize_title( $addon['id'] ); ?>" class="widefat">
						</div>
						<div class="su-admin-licenses-item-expires"><?php _e( 'Not activated', 'shortcodes-ultimate' ); ?></div>
						<div class="su-admin-licenses-item-submit">
							<?php submit_button( __( 'Activate', 'shortcodes-ultimate' ), 'primary', 'submit', false ); ?>
						</div>
						<input type="hidden" name="action" value="su_activate_license">
						<input type="hidden" name="name" value="<?php echo $addon['remote_name']; ?>">
						<input type="hidden" name="id" value="<?php echo $addon['id']; ?>">
						<?php wp_nonce_field( 'su_activate_license', 'nonce' ); ?>
					</form>
				</div>
			</div>

		<?php endif; ?>

	<?php endforeach; ?>

</div>
