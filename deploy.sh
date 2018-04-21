export PROJECT_NAME="react-redux-antd-generator"
export BASE_DIR="/Users/zhouyi/Desktop/deploy"
export PROJECT_DIR="$BASE_DIR/$PROJECT_NAME"

cd $BASE_DIR/$PROJECT_NAME
npm install --cache-min 9999999 --registry=http://172.16.116.19:7001/
npm run dist

pm2 delete $PROJECT_NAME
pm2 start dev-server --name $PROJECT_NAME  -- --root "$PROJECT_DIR/dist" --config "$PROJECT_DIR/proxy-rules.json"
