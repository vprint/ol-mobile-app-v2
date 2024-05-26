cd C:\Program Files\pg_featureserv
start "" pg_featureserv.exe --config config/pg_featureserv_EFEO_DEMO.toml

cd C:\Program Files\t-rex
start "" t_rex serve --config trexconfig_efeo_demo.toml

cd C:\Program Files\GeoServer\bin
start "" startup.bat

cd C:\OSGeo4W\demoservice
call C:\OSGeo4W\bin\o4w_env.bat
start "" C:\OSGeo4W\apps\Python39\Scripts\mapproxy-util.exe serve-develop -b 8082 mapproxy.yaml
