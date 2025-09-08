import { type RDKitModule } from "@rdkit/rdkit";

const initRDKit = (() => {
  let rdkitLoadingPromise: Promise<RDKitModule>;

  return () => {
    if (!rdkitLoadingPromise) {
      rdkitLoadingPromise = new Promise((resolve, reject) => {
        window
          .initRDKitModule()
          .then((RDKit) => {
            window.RDKit = RDKit;
            resolve(RDKit);
          })
          .catch(() => {
            reject();
          });
      });
    }

    return rdkitLoadingPromise;
  };
})();

export default initRDKit;