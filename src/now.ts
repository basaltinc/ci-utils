import fetch from 'node-fetch';
import qs from 'querystring';

const { ZEIT_TOKEN } = process.env;

if (!ZEIT_TOKEN) {
  console.log('Missing env var: ZEIT_TOKEN');
  process.exit(1);
}

/**
 * @link https://zeit.co/docs/api/v1/#endpoints/deployments/list-all-the-deployments
 */
export function getLatestDeploy({
  projectId,
  teamId,
}: {
  /** the `name` in `now.json` */
  projectId: string;
  teamId: string;
}): Promise<{ url: string; meta: {} }> {
  return new Promise((resolve, reject) => {
    const query = {
      teamId,
    };
    fetch(`https://api.zeit.co/v5/now/deployments?${qs.stringify(query)}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${ZEIT_TOKEN}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(
            `Error getting latest now.sh deploy: ${res.statusText}`,
          );
        }
        return res.json();
      })
      .then(
        ({
          deployments,
        }: {
          deployments: {
            name: string;
            created: string;
            url: string;
          }[];
        }) => {
          if (deployments.length === 0) {
            reject(new Error('Zero deployments returned'));
          }
          const theseDeploys = projectId
            ? deployments.filter(d => d.name === projectId)
            : deployments;
          theseDeploys.sort(function(a, b) {
            // Turn created unix time strings into dates, and then sort by what happened most recently
            return (
              new Date(a.created).getTime() + new Date(b.created).getTime()
            );
          });
          const [deployment] = theseDeploys;

          if (deployment && deployment.url) {
            resolve({
              url: deployment.url,
              meta: deployment,
            });
          } else {
            reject(new Error('No deployments found'));
          }
        },
      )
      .catch(error => {
        reject(error);
      });
  });
}
