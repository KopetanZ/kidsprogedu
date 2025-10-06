PWA用アイコン画像の作成方法

必要なファイル:
- icon-192.png (192x192px)
- icon-512.png (512x512px)

アイコンデザイン案:
- 背景色: #4F8EF7 (青)
- メインモチーフ: ブロックのイラスト、または「プ」の文字
- スタイル: 丸みのあるデザイン、子供向け

簡易作成方法:
1. オンラインツール（Canva、Figmaなど）を使用
2. 192x192pxと512x512pxのサイズで作成
3. PNG形式で保存
4. このフォルダ（public/）に配置

または、開発用の仮アイコン:
以下のコマンドで単色の仮アイコンを生成できます（ImageMagickが必要）:
convert -size 192x192 xc:#4F8EF7 -gravity center -pointsize 80 -fill white -annotate +0+0 "プ" icon-192.png
convert -size 512x512 xc:#4F8EF7 -gravity center -pointsize 200 -fill white -annotate +0+0 "プ" icon-512.png
