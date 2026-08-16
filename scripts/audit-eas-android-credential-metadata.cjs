#!/usr/bin/env node

const token = process.env.EXPO_TOKEN;
if (!token) {
  console.error("EXPO_TOKEN is required for the read-only EAS credential metadata audit.");
  process.exit(1);
}

const projectIds = {
  current: "5bf9c92f-2974-422e-b6cb-958d6f7ae469",
  historical: "a7392ba6-c4a2-455d-b03c-9bc0233b7b12",
};

const credentialFields = `
  id
  applicationIdentifier
  isLegacy
  androidAppBuildCredentialsList {
    id
    name
    isDefault
    isLegacy
    androidKeystore {
      id
      type
      keyAlias
      md5CertificateFingerprint
      sha1CertificateFingerprint
      sha256CertificateFingerprint
      createdAt
      updatedAt
    }
  }
`;

const query = `
  query AndroidCredentialMetadata {
    app {
      currentProject: byId(appId: "${projectIds.current}") {
        id
        currentCredentials: androidAppCredentials(filter: {
          applicationIdentifier: "com.icecreamman.app"
          legacyOnly: false
        }) { ${credentialFields} }
        legacyCredentials: androidAppCredentials(filter: {
          applicationIdentifier: "com.icecreamman.app"
          legacyOnly: true
        }) { ${credentialFields} }
      }
      historicalProject: byId(appId: "${projectIds.historical}") {
        id
        currentCredentials: androidAppCredentials(filter: {
          applicationIdentifier: "com.icecreamman.app"
          legacyOnly: false
        }) { ${credentialFields} }
        legacyCredentials: androidAppCredentials(filter: {
          applicationIdentifier: "com.icecreamman.app"
          legacyOnly: true
        }) { ${credentialFields} }
      }
    }
  }
`;

function sanitizeCredential(credential) {
  return {
    id: credential.id,
    applicationIdentifier: credential.applicationIdentifier,
    isLegacy: credential.isLegacy,
    buildCredentials: (credential.androidAppBuildCredentialsList ?? []).map((buildCredential) => ({
      id: buildCredential.id,
      name: buildCredential.name,
      isDefault: buildCredential.isDefault,
      isLegacy: buildCredential.isLegacy,
      keystore: buildCredential.androidKeystore
        ? {
            id: buildCredential.androidKeystore.id,
            type: buildCredential.androidKeystore.type,
            keyAlias: buildCredential.androidKeystore.keyAlias,
            md5CertificateFingerprint: buildCredential.androidKeystore.md5CertificateFingerprint,
            sha1CertificateFingerprint: buildCredential.androidKeystore.sha1CertificateFingerprint,
            sha256CertificateFingerprint: buildCredential.androidKeystore.sha256CertificateFingerprint,
            createdAt: buildCredential.androidKeystore.createdAt,
            updatedAt: buildCredential.androidKeystore.updatedAt,
          }
        : null,
    })),
  };
}

function sanitizeProject(project) {
  if (!project) {
    return null;
  }
  return {
    id: project.id,
    currentCredentials: (project.currentCredentials ?? []).map(sanitizeCredential),
    legacyCredentials: (project.legacyCredentials ?? []).map(sanitizeCredential),
  };
}

async function main() {
  const response = await fetch("https://api.expo.dev/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Expo credential metadata request failed with HTTP ${response.status}.`);
  }

  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(`Expo credential metadata query failed: ${result.errors.map(({ message }) => message).join("; ")}`);
  }

  console.log(
    JSON.stringify(
      {
        currentProject: sanitizeProject(result.data?.app?.currentProject),
        historicalProject: sanitizeProject(result.data?.app?.historicalProject),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
