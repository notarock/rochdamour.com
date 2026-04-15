FROM nixos/nix:2.34.6 AS builder

# Copy our source and setup our working dir.
COPY . /tmp/build
WORKDIR /tmp/build

# Build our Nix environment
RUN nix \
    --extra-experimental-features "nix-command flakes" \
    --option filter-syscalls false \
    build

FROM nginx:1.30
COPY --from=builder /tmp/build/result /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
