#Check whether target space is passed or not
case $1 in
  D)
    SPACE="DEV"
    VER=mta_archives/knpl-influencer-web_1.0.1.mtar
    ;;

  U)
    SPACE="UAT"
    VER=mta_archives/knpl-influencer-web_1.0.0.mtar
    ;;
  P)
    SPACE="PREPRD"
    VER=mta_archives/knpl-influencer-web_3.1.1.mtar
    ;;

  *)
   echo "Ileagal selected space. Please send D for DEV or U for UAT or P for PREPRD as argument"
   exit 1
    ;;  
esac

#Login to CF space
cf login -a https://api.cf.ap11.hana.ondemand.com -u ankit.pundhir@extentia.com -p Admin@2022 -o "Kansai Nerolac Paints Ltd_knpl-painter-preprd" -s "${SPACE}"

echo "Building Project"
mbt build -s '/home/user/projects/knpl-influencer-web'

if [[ $? -eq 0 ]]; then
    echo "build complete Now deploying"
    cf deploy $VER --delete-services
    git reset --hard
else
    echo "corrupt MTA file please check."
fi    
