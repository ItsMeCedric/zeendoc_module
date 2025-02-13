import { useState } from "react"; // pour gérer les états
import axios from "axios"; // pour les requêtes
import { sha256 } from "js-sha256"; // pour le hachage SHA256

// React fonctionne en fonction fléchée, donc là je crée une fonction ZeendocAuth
// qui contiendra tout mon code pour s'authentifier
const ZeendocAuth = () => {
  // je déclare mes differentes variable et la fonction qui permet de mettre l'état
  // à jour et leur assigne une valeur par défaut vide

  // ma variable pour le refreshToken
  const [refreshToken, setRefreshToken] = useState(null);
  // ma variable pour l'accesToken
  const [accessToken, setAccessToken] = useState(null);
  // ma variable qui contiendra une éventuelle erreur
  const [error, setError] = useState(null);
  // ma variable qui contiendra la réponse
  const [responseJson, setResponseJson] = useState(null);

  // Zeendoc me demande de générer un code "challenger" pour le hash
  const generateChallenge = () => {
    return "OYBrIFqSEicknSLtLIEHD-IcfSAMRutu";
  };
  // ici je retourne bêtement la valeur de la doc mais en pratique ça doit
  // être une fonctoin pour générer un code aléatoire

  // je hash la variable challenge via la librairie sha256
  const generateHash = (challenge) => {
    return sha256(challenge);
  };

  // ma fonction pour le RefreshToken
  const getRefreshToken = async () => {
    // je déclare les différentes variables dont j'ai besoin
    // le clientID
    const clientId = "donnée_manquante";
    // email du compte applicatif
    const username = "tests_webservices@zeendoc.com";
    // mot de passe du compte applicatif
    const password = "tests01";
    // l'identifiant du client pour lequel créer l'accès, là je sèche sur ce que c'est
    const nClient = "donnée_manquante";

    // je déclare que mon code challenge est le résultat de la fonction associée
    const challenge = generateChallenge();
    // je déclare que mon "hash" est le resultat de la fonction associée sur la variable challenge
    const hash = generateHash(challenge);

    // là je lance une promise
    try {
      // je lance ma requête POST en renseignant le GET dans l'URL du service (la partie après ?)
      const response = await axios.post(
        `https://armoires.zeendoc.com/_Login_OAuth/authorize.php?code_challenge_method=sha256&code_challenge=${hash}`,
        {
          client_id: clientId,
          response_type: "code",
          redirect_uri:
            "https://armoires.zeendoc.com/_Login_OAuth/get_code.php",
          state: challenge,
          username: username,
          password: password,
          N_Client: nClient,
        }
      );

      // je mets à jour mes variables concernées en utilisant les fonctions associées
      setRefreshToken(response.data.refresh_token);
      setError(null);
    } catch (err) {
      // en cas d'échec, je récupère l'erreur en affanchant mon message
      setError("Erreur lors de la récupération du refresh token");
      // et le message reçu
      console.error(err);
    }
  };

  // ma fonction pour le AccessToken, c'est à peu près la même chose que
  // la précédente mais sans données dans l'URL
  const getAccessToken = async () => {
    // je déclare mes variables, je n'en ai aucune à ce jour
    // Client ID
    const clientId = "CLIENT_ID";
    // Client Secret
    const clientSecret = "CLIENT_SECRET";

    // Je lance ma requête sur l'URL adéquate
    try {
      const response = await axios.post(
        "https://armoires.zeendoc.com/_Login_OAuth/token.php",
        null,
        {
          params: {
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri:
              "https://armoires.zeendoc.com/_Login_OAuth/get_code.php",
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          },
        }
      );

      // je mets à jour mes variables
      setAccessToken(response.data.access_token);
      // ici, soit la réponse est déjà en json,
      // soit j'utiliserai la fonction JS dessous pour la transformer en json
      setResponseJson(response.data);
      // setResponseJson(JSON.stringify(response.data, null, 2));
      setError(null);
    } catch (err) {
      // en cas d'erreur
      setError("Erreur lors de la récupération de l'access token");
      setResponseJson(err.response?.data || { error: "Unknown error" });
      // idem si ce n'est pas un json
      // setResponseJson(JSON.stringify(err.response?.data || { error: "Unknown error" },null,2));
      console.error(err);
    }
  };

  // ici je teste une requête pour le document 7825 du 1er classeur
  const handleClick = () => {
    const URL_CLIENT = "tests_webservices";
    const Coll_Id = "coll_1";
    const Id_Document = "7825";
    const Email_Utilisateur = "tests_webservices@zeendoc.com";
    const Password_Utilisateur = "tests01";

    // la construction de mon URL, qui s'ouvrira dans une autre fenetre
    // car Zeendoc n'autorise pas l'intégration dans la page du site (iframe)
    const downloadUrl = `https://armoires.zeendoc.com/${URL_CLIENT}/Ihm/View/docs_view_light.php?id=${Id_Document}&Coll_Id=${Coll_Id}&Login=${Email_Utilisateur}&CPassword=${Password_Utilisateur}`;
    window.open(downloadUrl, "_blank");
  };

  // ici s'arrête le contenu de ma fonction React
  // après le return, je construit ce qui s'affichera dans le navigateur
  // et les actions associés ainsi que les valeurs attendues pour les tokens
  return (
    <div className="container">
      <button onClick={getRefreshToken}>Obtenir le Refresh Token</button>
      <button onClick={getAccessToken} disabled={!refreshToken}>
        Vérifier le Refresh Token
      </button>
      <button onClick={handleClick} style={{ cursor: "pointer" }}>
        Test PDF
      </button>

      {accessToken && <p>Access Token: {accessToken}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {responseJson && <pre>{JSON.stringify(responseJson, null, 2)}</pre>}
    </div>
  );
};

export default ZeendocAuth;
