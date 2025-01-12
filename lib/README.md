# Preparing the Environment

The most productive way I found to have the last Oid libraries updated is to clone the Oid repository. Inside a directory `/home/user/git/` clone it:

~~~
git clone https://github.com/mundorum/oid.git
~~~

`/home/user/git/` is a hypothetical directory you must update to your machine.

Map the `foundation` folder in this directory to the `/lib/foundation` folder of the Oid repository:

~~ 
ln -s /home/user/git/oid/lib/foundation/ foundation
~~~
