

echo "Building Project"

mbt build -s '/home/user/projects/knpl-influencer-web'

echo "build complete Now deploying"

cf deploy mta_archives/knpl-influencer-web_1.0.1.mtar --delete-services