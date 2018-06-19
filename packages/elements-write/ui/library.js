(function(Pageboard) {
Pageboard.Controls.Library = Library;

function Library(editor, selector) {
	this.$node = $(selector);
	this.editor = editor;
}

Library.prototype.update = function(parents) {

};

})(window.Pageboard);


Il faut que la librairie permette plusieurs choses:

- chercher dans les blocs du site
- chercher dans les fichiers uploadés

- partager un bloc
- charger des fichiers
- saisir des url

# Comment est traité un fichier ?

Un fichier ne peut pas être utilisé autrement que dans un bloc.
Quand on veut ajouter un fichier, il faut en premier ajouter un bloc qui accepte
un fichier quelquepart (une bloc image par exemple, ou simplement un bloc fichier).

Les fichiers sont des URL, pas des blocs.
Par exemple un fichier ne possède pas de paramètres.
On pourrait voir un fichier "inspecté" comme un bloc...
Du coup quand on veut mettre un fichier dans une image, on peut créer un bloc image,
puis chercher le fichier et le copier dedans.

Menu -> Bloc image -> bloc ajouté et paramètres affichés
dans les paramètres il y a un champ "url" avec un bouton + à gauche.
Soit on saisit une url, soit on recherche un fichier, soit on ajoute (par +) un fichier.

Le même champ permet de chercher un fichier ou ajouter une url.
La zone de résultats de recherche permet de voir les fichiers trouvés ou voir une url inspectée.


******* empty url field **********

[+] "paste url or search here"

********* paste url **************

[+] "http://monfichier.com/test.jpg"
| inspected url result
| thumbnail / metadata
----------------------

********** search url ************

[+] "appartement bleu"
| database result 1
| thumbnail / metadata
------
| database result 2
| thumbnail / metadata
------
| database result 3
| thumbnail / metadata
------

****** not empty url field *******

[+] "http://monfichier.com/test.jpg"
| database result, saved from inspected
| thumbnail / metadata
------

**********************************

*********** load file ************

Clic sur [+] ouvre un dialogue pour choisir un fichier local,
puis transforme le champ de saisie en barre de chargement:

[+] xxxxxxxx33%-------------------


********** file loaded ***********

[+] "/media/123654-myloaded-file.jpg"
| file is inspected and database result is shown here
| thumbnail / metadata
------

**********************************



Le fonctionnement est différent de la librairie:

- la librairie est faite pour *insérer* des blocs dans la page
- la gestion des url est faite pour copier une url dans un attribut de bloc
- on ne peut pas forcément insérer une url (même inspectée) en tant que bloc
sans faire un choix, et ce choix consiste justement à créer le bloc pour mettre une url
dedans

En revanche, il faut définir où sont enregistrés les fichiers.
-> dans une table à part, genre ressources, sans relation - idéalement la gestion des fichiers
est faite dans un module à part pageboard-upload
-> pageboard-upload != pageboard-inspector != pageboard-image != pageboard-api
un service pour charger des fichiers, un service pour inspecter des url, un service pour
retailler des images, un service pour enregistrer des ressources




[+] zone de recherche [S]

clic sur [+]: affiche des options pour ajouter des fichiers (local, remote)

- remote consiste à saisir une url


