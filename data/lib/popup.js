var url;
var config;

function writeModel () {
	config.tag = $('#tag').val ();
	if (config.tag.startsWith ("compatible:")) {
		config.tag = substringAfter (config.tag, "compatible:");
		delete config.policy.seed;
	} else {
		if (null == config.policy.seed) {
			config.policy.seed = config.options.privateSeed;
		}
	}
	config.policy.length = $('#length').val ();
	config.policy.strength = $('#strength').val ();
	chrome.extension.getBackgroundPage ().saveConfig (url, config);
	if(null == config.policy.seed || config.policy.seed == config.options.privateSeed) {
		$("#syncneeded").addClass("hidden");
	}
}

function readModel () {
	$('#tag').val (config.tag);
	$('#tag').autocomplete ({ source: chrome.extension.getBackgroundPage ().loadTags () });
	$('#length').val (config.policy.length);
	$('#strength').val (config.policy.strength);
	if (true == config.options.compatibilityMode) {
		$('div#compatmodeheader').html ("<b>Compatibility:</b>");
		$('div#compatmode').text ("on");
	} else if (null == config.policy.seed) {
		$('#tag').val ("compatible:" + config.tag);
	}
	if (false == config.options.backedUp && false == config.options.compatibilityMode) {
		$('div#compatmodeheader').html ("<b>Warning:</b>");
		$('div#compatmode').text ("You have not yet indicated that you have backed up your private key. Please do so on the Options page.");
	}
	if(null != config.policy.seed && config.policy.seed != config.options.privateSeed) {
		$("#syncneeded").removeClass("hidden");
	}
}

compat.loadConfig(function(url_, config_, tags_) {
        url = url_;
        config = config_;
        config.fields = toSet(config.fields);
        readModel(tags_);
});

$('#bump').click (function () {
	$("#tag").val (bump ($("#tag").val ()));
	writeModel ();
});

$('#tag').change (writeModel);
$('#length').change (writeModel);
$('#strength').change (writeModel);

$(document).ready(function() {
	$('#link-options').click(function() {
		compat.createOptionsTab();
	});
	$('#portablePage').click(function() {
		compat.createPortableTab();
	});
});
