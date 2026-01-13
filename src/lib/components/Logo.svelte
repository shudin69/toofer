<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { size = 32 }: { size?: number } = $props();
</script>

<img src={favicon} alt="" width={size} height={size} aria-hidden="true" />
