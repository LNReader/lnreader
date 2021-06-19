import { useState, useEffect } from "react";

export const githubUpdateChecker = () => {
    const latestReleaseUrl =
        "https://api.github.com/repos/rajarsheechatterjee/lnreader/releases/latest";

    const [checking, setChecking] = useState(true);
    const [latestRelease, setLatestRelease] = useState();

    const checkForRelease = async () => {
        let res = await fetch(latestReleaseUrl);
        res = await res.json();

        const release = {
            tag_name: res.tag_name,
            body: res.body,
            downloadUrl: res.assets[0].browser_download_url,
        };

        setLatestRelease(release);
        setChecking(false);
    };

    const isNewVersion = (versionTag) => {
        let currentVersion = "v1.0.21";
        const regex = /[^\\d.]/;

        let newVersion = versionTag.replace(regex, "");
        currentVersion = currentVersion.replace(regex, "");

        return newVersion !== currentVersion;
    };

    useEffect(() => {
        checkForRelease();
    }, []);

    if (!checking) {
        const data = {
            latestRelease,
            isNewVersion: isNewVersion(latestRelease.tag_name),
        };

        return data;
    }
};
