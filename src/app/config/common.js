var config = {};

config.DEFAULT_MODE = "dev"
config.GCLOUD_PROJECT_NUMBER = "1041773824348"
config.SECRETS_PATH = `projects/${config.GCLOUD_PROJECT_NUMBER}/secrets`
config.SECRET_VERSION = "latest"
config.TELEM_PREFIX = "$$"
config.TELEM_SEP = ","

module.exports = config;