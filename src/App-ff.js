import React, { useState } from "react";
import {
  createInstance,
  OptimizelyProvider,
  useDecision,
} from "@optimizely/react-sdk";

const optimizelyClient = createInstance({ sdkKey: "Tx6VAEgGtijKifAiw5Yo9" });

function Pre(props) {
  return <pre style={{ margin: 0 }}>{props.children}</pre>;
}

function isClientValid() {
  return optimizelyClient.getOptimizelyConfig() !== null;
}

const userIds = [];
while (userIds.length < 10) {
  // to get rapid demo results, generate an array of random users. Each user always sees the same variation unless you reconfigure the flag rule.
  userIds.push((Math.floor(Math.random() * 999999) + 100000).toString());
}

function App() {
  const [hasOnFlag, setHasOnFlag] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isClientReady, setIsClientReady] = useState(null);

  optimizelyClient.onReady().then(() => {
    setIsDone(true);
    isClientValid() && setIsClientReady(true);
  });

  let projectId = "{project_id}";
  if (isClientValid()) {
    const datafile = JSON.parse(
      optimizelyClient.getOptimizelyConfig().getDatafile()
    );
    projectId = datafile.projectId;
  }

  return (
    <OptimizelyProvider
      optimizely={optimizelyClient}
      // Generally React SDK runs for one client at a time i.e for one user throughout the lifecycle.
      // You can provide the user Id here once and the SDK will memoize and reuse it throughout the application lifecycle.
      // For this example, we are simulating 10 different users so we will ignore this and pass override User IDs to the useDecision hook for demonstration purpose.
      user={{ id: "default_user" }}
    >
      <pre>Welcome to our Quickstart Guide!</pre>
      {isClientReady && (
        <>
          {userIds.map((userId) => (
            <Decision
              key={userId}
              userId={userId}
              setHasOnFlag={setHasOnFlag}
            />
          ))}
          <br />
          {!hasOnFlag && <FlagsOffMessage projectId={projectId} />}
        </>
      )}
      {isDone && !isClientReady && (
        <Pre>
          Optimizely client invalid. Verify in Settings -> Environments that you
          used the primary environment's SDK key
        </Pre>
      )}
    </OptimizelyProvider>
  );
}

function FlagsOffMessage({ projectId }) {
  const navLink = `https://app.optimizely.com/v2/projects/${projectId}/settings/implementation`;
  return (
    <div>
      <Pre>Flag was off for everyone. Some reasons could include:</Pre>
      <Pre>
        1. Your sample size of visitors was too small. Rerun, or increase the
        iterations in the FOR loop
      </Pre>
      <Pre>
        2. By default you have 2 keys for 2 project environments (dev/prod).
        Verify in Settings>Environments that you used the right key for the
        environment where your flag is toggled to ON.
      </Pre>
      <Pre>
        Check your key at <a href={navLink}>{navLink}</a>
      </Pre>
      <br />
    </div>
  );
}

function Decision({ userId, setHasOnFlag }) {
  // Generally React SDK runs for one client at a time i.e for one user throughout the lifecycle.
  // You can provide the user Id once while wrapping the app in the Provider component and the SDK will memoize and reuse it throughout the application lifecycle.
  // For this example, we are simulating 10 different users so we will ignore this and pass override User IDs to the useDecision hook for demonstration purpose.
  // This override will not be needed for normal react sdk use cases.
  const [decision, clientReady] = useDecision(
    "product_sort",
    {},
    { overrideUserId: userId }
  );

  // Don't render the component if SDK client is not ready yet.
  if (!clientReady) {
    return "";
  }

  const variationKey = decision.variationKey;

  // did decision fail with a critical error?
  if (variationKey === null) {
    console.log(" decision error: ", decision["reasons"]);
  }

  if (decision.enabled) {
    setTimeout(() => setHasOnFlag(true));
  }

  // get a dynamic configuration variable
  // "sort_method" corresponds to a variable key in your Optimizely project
  const sortMethod = decision.variables["sort_method"];

  return (
    <Pre>
      {`\nFlag ${
        decision.enabled ? "on" : "off"
      }. User number ${userId} saw flag variation: ${variationKey} and got products sorted by: ${sortMethod} config variable as part of flag rule: ${
        decision.ruleKey
      }`}
    </Pre>
  );
}

export default App;
