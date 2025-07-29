
CONTAINER_USER="$(shell id -u):$(shell id -g)"

IMAGE="ghcr.io/getzola/zola:v0.19.1"

CONTAINER_NAME="blog.woolsey.dev"
PROJECT_NAME="blog.woolsey.dev"

version:
	docker run --name ${CONTAINER_NAME} --rm -it ${IMAGE} --version

init:
	docker run --name ${CONTAINER_NAME} --rm -it --user ${CONTAINER_USER} -v ${PWD}:/app --workdir /app ${IMAGE} init ${PROJECT_NAME}

build:
	docker run --name ${CONTAINER_NAME} --rm --user ${CONTAINER_USER} -v ${PWD}:/app --workdir /app/${PROJECT_NAME} ${IMAGE} build

serve:
	docker run --name ${CONTAINER_NAME} --rm --user ${CONTAINER_USER} -v ${PWD}:/app --workdir /app/${PROJECT_NAME} --network host ${IMAGE} serve --interface 0.0.0.0 --port 8111 --base-url localhost

date:
	date +'%Y-%m-%dT%H:%M:%SZ' --utc

cleanup:
	find ./${PROJECT_NAME}/ -name *.jpg -or -name *.jpeg
	@echo "Cleaning up..."
	find ./${PROJECT_NAME}/ -name *.jpg -print0 -exec exiftool -overwrite_original "-gps*=" {} \;
	find ./${PROJECT_NAME}/ -name *.jpeg -print0 -exec exiftool -overwrite_original "-gps*=" {} \;
