#!/bin/sh
set -eu

ASSET_DIR="/usr/share/nginx/html"
ENV_FILE="${ASSET_DIR}/.env"

if [ -f "${ENV_FILE}" ]; then
	while IFS='=' read -r key value; do
		case "${key}" in
			"" | \#*)
				continue
				;;
		esac

		placeholder="${value}"
		runtime="$(eval "printf '%s' \"\${${key}-}\"")"

		if [ -n "${runtime}" ] && [ "${runtime}" != "${placeholder}" ]; then
			esc_placeholder="$(printf '%s' "${placeholder}" | sed -e 's/[\/&]/\\&/g')"
			esc_runtime="$(printf '%s' "${runtime}" | sed -e 's/[\/&]/\\&/g')"
			find "${ASSET_DIR}" -type f \( -name '*.js' -o -name '*.css' -o -name '*.html' \) -print0 |
				xargs -0 sed -i "s/${esc_placeholder}/${esc_runtime}/g"
		fi
	done <"${ENV_FILE}"
fi

exec nginx -g 'daemon off;'
