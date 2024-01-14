# Common Problems with First Setup

### SDK Location not found. Define location with an ANDROID_SDK_ROOT environment variable. (expo modules error)

If you're on windows, you'll need to edit your system (system wide)/user (just you) environment variables. You'll want to add an environment variable named **ANDROID_SDK_ROOT** (legacy env variable name) and **ANDROID_HOME** that points to your android studio's sdk location. It'll most likely look something like this:

C:\Users\\**Username**\AppData\Local\Android\Sdk (copy paste this into the box)

Delete your node_modules folder, invalidate caches and restart in android studio and restart your machine. Follow the steps again in the [setup section](./CONTRIBUTING.md#setup).

### '.' is not recognized as an internal or external command, operable program or batch file. (npm run buildRelease error)

Run this line in the terminal instead: ```cd android ; ./gradlew clean ; ./gradlew assembleRelease```
