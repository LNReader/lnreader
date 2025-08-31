{
  description = "React Native development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
          android_sdk.accept_license = true;
        };

        androidEnv = pkgs.androidenv.override { licenseAccepted = true; };
        # The androidComposition now expects enableEmulator to be passed in
        # It's no longer defined here but passed from mkShell below.
        mkAndroidComposition = { enableEmulatorInput }: androidEnv.composeAndroidPackages {
          cmdLineToolsVersion = "8.0";
          platformToolsVersion = "35.0.2";
          buildToolsVersions = [ "35.0.0" ];
          platformVersions = [ "35" ];
          abiVersions = [ "x86_64" ];
          includeNDK = true;
          ndkVersions = [
            "27.1.12297006"
            "27.0.12077973"
          ];
          includeSystemImages = enableEmulatorInput; # Use the input parameter
          systemImageTypes = [ "google_apis" ];
          includeEmulator = enableEmulatorInput; # Use the input parameter
          useGoogleAPIs = true;
          extraLicenses = [
            "android-sdk-arm-dbt-license"
            "android-sdk-license"
            "android-sdk-preview-license"
            "google-gdk-license"
            "intel-android-extra-license"
            "intel-android-sysimage-license"
            "mips-android-sysimage-license"
          ];
        };

      in
            {
        devShells = {
          # Define a specific devShell for when emulator is enabled
          emulator =
            let
              enableEmulator = true;
               androidComposition = mkAndroidComposition { enableEmulatorInput = enableEmulator; };
              androidSdk = androidComposition.androidsdk;
            in
            pkgs.mkShell {
              buildInputs = with pkgs; [
                nodejs_20
                nodePackages.pnpm
                openjdk17
                androidSdk
                gradle
                git
                curl
                unzip
                which
                rsync
                scrcpy
              ]
              ++ pkgs.lib.optionals enableEmulator [
                libglvnd
                mesa
                vulkan-loader
                qemu_kvm
              ];
              shellHook = ''
                export ANDROID_USER_HOME="$HOME/.android-nix"
                mkdir -p "$ANDROID_USER_HOME"
                if [ ! -d "$ANDROID_USER_HOME/sdk" ]; then
                  echo "Setting up writable Android SDK. This may take a moment..."
                  mkdir -p "$ANDROID_USER_HOME/sdk"
                  rsync -a "${androidSdk}/libexec/android-sdk/" "$ANDROID_USER_HOME/sdk/"
                  chmod -R u+w "$ANDROID_USER_HOME/sdk"
                  echo "Writable Android SDK setup complete."
                fi
                export ANDROID_HOME="$ANDROID_USER_HOME/sdk"
                export ANDROID_SDK_ROOT="$ANDROID_HOME"
                export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
                export JAVA_HOME="${pkgs.openjdk17}"
                export REACT_NATIVE_PACKAGER_HOSTNAME="127.0.0.1"
                export ANDROID_NDK_HOME="$ANDROID_HOME/ndk-bundle"
                export NDK_HOME="$ANDROID_NDK_HOME"
                echo "Emulator support is ENABLED."
                export VK_ICD_FILENAMES="${pkgs.mesa}/share/vulkan/icd.d/radeon_icd.x86_64.json"
                export LD_LIBRARY_PATH="${pkgs.libglvnd}/lib:${pkgs.mesa}/lib''${LD_LIBRARY_PATH:+:}$LD_LIBRARY_PATH"
                export EGL_PLATFORM=x11
                if ! "$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager" list avd | grep -q "ReactNative_API35"; then
                  echo "Creating default AVD (ReactNative_API35 - Pixel 8 profile)..."
                  echo "no" | "$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager" create avd -n "ReactNative_API35" -k "system-images;android-35;google_apis;x86_64" -d "pixel_8"
                  echo "AVD created. First launch may take longer."
                fi
                echo "To launch emulator: emulator -avd ReactNative_API35 -gpu host -no-metrics -no-audio"
                echo "React Native development environment loaded!"
                echo "Android SDK: $ANDROID_HOME"
                echo "Android NDK: $ANDROID_NDK_HOME"
                echo "Java: $JAVA_HOME"
                echo "Emulator Enabled: Yes"
                echo ""
                echo "--- Available Commands ---"
                echo "  npx react-native run-android"
                echo "  adb devices"
                echo "  scrcpy"
                echo "  npm start"
                echo "--------------------------"
              '';
            };
          
          # Define a specific devShell for when emulator is disabled
          default =
            let
              enableEmulator = false; # Define enableEmulator locally for this shell instance
              androidComposition = mkAndroidComposition { enableEmulatorInput = enableEmulator; };
              androidSdk = androidComposition.androidsdk;
            in
            pkgs.mkShell {
              buildInputs = with pkgs; [
                nodejs_20
                nodePackages.pnpm
                openjdk17
                androidSdk
                gradle
                git
                curl
                unzip
                which
                rsync
                scrcpy
              ]
              ++ pkgs.lib.optionals enableEmulator [ # This list will be empty as enableEmulator is false
                libglvnd
                mesa
                vulkan-loader
                qemu_kvm
              ];
              shellHook = ''
                export ANDROID_USER_HOME="$HOME/.android-nix"
                mkdir -p "$ANDROID_USER_HOME"
                if [ ! -d "$ANDROID_USER_HOME/sdk" ]; then
                  echo "Setting up writable Android SDK. This may take a moment..."
                  mkdir -p "$ANDROID_USER_HOME/sdk"
                  rsync -a "${androidSdk}/libexec/android-sdk/" "$ANDROID_USER_HOME/sdk/"
                  chmod -R u+w "$ANDROID_USER_HOME/sdk"
                  echo "Writable Android SDK setup complete."
                fi
                export ANDROID_HOME="$ANDROID_USER_HOME/sdk"
                export ANDROID_SDK_ROOT="$ANDROID_HOME"
                export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
                export JAVA_HOME="${pkgs.openjdk17}"
                export REACT_NATIVE_PACKAGER_HOSTNAME="127.0.0.1"
                export ANDROID_NDK_HOME="$ANDROID_HOME/ndk-bundle"
                export NDK_HOME="$ANDROID_NDK_HOME"
                echo "Emulator support is DISABLED. Focusing on physical device development."
                echo "React Native development environment loaded!"
                echo "Android SDK: $ANDROID_HOME"
                echo "Android NDK: $ANDROID_NDK_HOME"
                echo "Java: $JAVA_HOME"
                echo "Emulator Enabled: No"
                echo ""
                echo "--- Available Commands ---"
                echo "  npx react-native run-android"
                echo "  adb devices"
                echo "  scrcpy"
                echo "  npm start"
                echo "--------------------------"
              '';
            };            
        };
      });
}