import React from "react";
import { useSidebarUtils } from "./utils/sidebarUtils";
import {
  TextField,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Box,
  Typography,
  LinearProgress,
} from "@mui/material";

interface SideBarProps {
  textAreaValue: string;
}

const SideBar: React.FC<SideBarProps> = ({ textAreaValue }) => {
  // Properties from sidebarUtils
  const {
    activeMenu,
    setActiveMenu,
    keyword,
    pageTitle,
    metaDescription,
    titleHelperVisibility,
    setTitleHelperVisibility,
    descriptionHelperVisibility,
    setDescriptionHelperVisibility,
    handleKeywordChange,
    handlePageTitleChange,
    handleMetaDescriptionChange,
    handleTitleBlur,
    handleDescriptionBlur,
    calculateKeywordDensity,
    checkImageNames,
    checkImageAltText,
    formatDescription,
    formatTitle,
  } = useSidebarUtils();

  // Preprocessing of input and setting up of basic variables
  let textWithoutHTML = textAreaValue.replace(/(<([^>]+)>)/gi, "");
  let wordsArray = textWithoutHTML.split(/\s+/).filter(Boolean);
  let wordCount = wordsArray.length;

  // Checking and processing h1 tags
  const h1Check = /<h1>(\S*?)<\/h1>/i.exec(textAreaValue);
  const keywordInH1 =
    h1Check &&
    new RegExp(`\\b${keyword.toLowerCase()}\\b`, "i").test(
      h1Check[1].toLowerCase()
    );

  // Checking first paragraph for keyword
  const keywordInFirstParagraph = new RegExp(
    `<p[^>]*>\\s*${keyword.toLowerCase()}`
  ).test(textAreaValue.toLowerCase());

  // Checking and processing img tags
  const imgCheck = /<\s*img/.test(textAreaValue);
  const imgAltRegex = checkImageAltText(textAreaValue, keyword);
  const keywordInImgName = checkImageNames(textAreaValue, keyword);

  // Checking for links
  const linkCheck = /<\s*a/.test(textAreaValue);

  // Keyword density calculations
  const keywordDensity = calculateKeywordDensity(textWithoutHTML, keyword);
  const desiredMinDensity = 1;
  const desiredMaxDensity = 2;
  const keywordOccurrences = (
    textWithoutHTML.match(new RegExp(`\\b${keyword}\\b`, "gi")) || []
  ).length;
  const actualDensity = (keywordOccurrences / wordCount) * 100;

  const helper = {
    // Keyword related properties
    keywordNotEmpty: keyword !== "",
    keywordInTitle:
      keyword !== "" && pageTitle.toLowerCase().includes(keyword.toLowerCase()),
    keywordAtBeginning:
      keyword !== "" &&
      pageTitle.toLowerCase().startsWith(keyword.toLowerCase()),
    keywordInDescription:
      keyword !== "" &&
      metaDescription.toLowerCase().includes(keyword.toLowerCase()),
    keywordInH1: keywordInH1,
    keywordInFirstParagraph: keywordInFirstParagraph,
    keywordInImgName: keywordInImgName,
    keywordInImgAlt: imgAltRegex,

    // Title related properties
    titleSufficient: pageTitle.length >= 30,
    titleGreat: pageTitle.length >= 50,
    titleTooLong: pageTitle.length > 60,

    // Description related properties
    descriptionSufficient: metaDescription.length >= 50,
    descriptionGreat: metaDescription.length > 100,
    descriptionTooLong: metaDescription.length > 160,

    // Existence related properties
    h1Exists: h1Check !== null,
    textExists: textWithoutHTML !== "",
    imgExists: imgCheck,
    linkExists: linkCheck,

    // Other properties related to word count and density
    sufficientWordCount: wordCount >= 300,
    optimalKeywordDensity: keywordDensity < 2,
  };

  // Description score calculation
  const calculateDescriptionScore = () => {
    let descriptionScore = 0;
    if (helper.keywordNotEmpty) descriptionScore += 25;
    if (helper.keywordInDescription) descriptionScore += 25;
    if (helper.descriptionSufficient) {
      if (helper.descriptionGreat) descriptionScore += 50;
      else descriptionScore += 25;
    }
    return descriptionScore;
  };

  // Title score calculation
  const calculateTitleScore = () => {
    let titleScore = 0;
    if (helper.keywordInTitle) titleScore += 25;
    if (helper.keywordAtBeginning) titleScore += 25;
    if (helper.titleSufficient) {
      if (helper.titleGreat) titleScore += 50;
      else titleScore += 25;
    }
    return titleScore;
  };

  // Content score calculation
  const calculateContentScore = () => {
    let contentScore = 0;

    contentScore += helper.h1Exists ? 10 : 0;
    contentScore += helper.keywordInH1 ? 15 : 0;
    contentScore += helper.textExists ? 5 : 0;
    contentScore += helper.sufficientWordCount ? 5 : 0;
    contentScore += helper.keywordInFirstParagraph ? 10 : 0;
    contentScore += helper.optimalKeywordDensity ? 15 : 0;
    contentScore += helper.imgExists ? 10 : 0;
    contentScore += helper.keywordInImgName ? 10 : 0;
    contentScore += helper.keywordInImgAlt ? 10 : 0;
    contentScore += helper.linkExists ? 10 : 0;

    return contentScore;
  };

  // Helper component for rendering UI elements in the Sidebar
  const renderHelper = (
    check: boolean,
    label: string,
    colorFn: () => string
  ) => {
    return (
      <Box sx={{ display: "flex", alignItems: "center", marginTop: "0.5rem" }}>
        <Box
          sx={{
            minWidth: 16,
            minHeight: 16,
            width: 16,
            height: 16,
            marginRight: "0.5rem",
            backgroundColor: colorFn(),
            borderRadius: "50%",
          }}
        />
        <Typography variant="body2">{label}</Typography>
      </Box>
    );
  };

  const renderContent = () => {
    if (activeMenu === "input") {
      return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ marginTop: "2rem" }}>
            <TextField
              label="1. Enter focus keyword"
              variant="outlined"
              value={keyword}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ style: { paddingLeft: "15px" } }}
              onChange={handleKeywordChange}
            />
            <Box
              sx={{
                width: "100%",
                borderBottom: "1px dashed #aaa",
                paddingTop: "10px",
                marginTop: "15px",
                marginBottom: "15px",
              }}
            />
          </Box>

          <Box sx={{ display: "flex" }}>
            <Tooltip placement="top" title="Google Search result preview">
              <img
                height="50"
                width="50"
                src="https://kormassage.s3.ap-northeast-2.amazonaws.com/resized-1024-images-ad3ddadf-fc9b-4343-992e-93c5c704b8d5.webp"
                alt="Kormsg logo"
                style={{ marginRight: "1rem" }}
              />
            </Tooltip>
            <h3>Kormsg Blog Preview</h3>
          </Box>

          <Box
            sx={{
              backgroundColor: "#f8f8f8",
              padding: "1rem",
              marginTop: "1rem",
              borderRadius: "8px",
              textAlign: "left",
            }}
          >
            <Typography
              variant="body2"
              component="div"
              color="text.secondary"
              gutterBottom
              sx={{ fontSize: "13px" }}
            >
              {"kormsg.com > blog"}
            </Typography>
            <Typography
              variant="h6"
              component="div"
              gutterBottom
              sx={{ color: "#1967D2", wordWrap: "break-word" }}
            >
              {pageTitle
                ? formatTitle(pageTitle)
                : "This is an Example page Title"}
            </Typography>
            <Typography
              variant="body2"
              component="div"
              color="text.secondary"
              sx={{ fontSize: "14px", wordWrap: "break-word" }}
            >
              {metaDescription
                ? formatDescription(metaDescription)
                : "Use the input fields to write a custom page Title and Meta description. This preview box shows you how your page will look in the search results from Google."}
            </Typography>
          </Box>

          <Box sx={{ marginTop: "2rem" }}>
            <Box
              sx={{
                width: "100%",
                marginBottom: "1rem",
              }}
            >
              <TextField
                label="2. Enter Page Title"
                variant="outlined"
                value={pageTitle}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                onFocus={() => setTitleHelperVisibility(true)}
                onBlur={handleTitleBlur}
                onChange={handlePageTitleChange}
              />

              {titleHelperVisibility && (
                <Box
                  sx={{
                    marginTop: "1rem",
                    textAlign: "left",
                  }}
                >
                  {helper.keywordNotEmpty ? (
                    <>
                      {helper.keywordInTitle
                        ? renderHelper(
                            helper.keywordInTitle,
                            `The focus keyword "${keyword}" appears in the Page Title`,
                            () => "green"
                          )
                        : renderHelper(
                            helper.keywordInTitle,
                            `The focus keyword "${keyword}" doesn't appear in the Page Title`,
                            () => "red"
                          )}
                      {helper.keywordAtBeginning
                        ? renderHelper(
                            helper.keywordAtBeginning,
                            "Focus keyword appears at the beginning of the Page Title",
                            () => "green"
                          )
                        : renderHelper(
                            helper.keywordAtBeginning,
                            "Put the focus keyword at the beginning of Page Title",
                            () => "red"
                          )}
                      {helper.titleTooLong
                        ? renderHelper(
                            false,
                            `The Page Title is too long. Remove ${
                              pageTitle.length - 60
                            } characters.`,
                            () => "red"
                          )
                        : helper.titleGreat
                        ? renderHelper(
                            true,
                            `The Page Title length is great! ${
                              60 - pageTitle.length
                            } characters available. (${
                              pageTitle.length
                            } of 60 characters used)`,
                            () => "green"
                          )
                        : helper.titleSufficient
                        ? renderHelper(
                            true,
                            `The Page Title length is sufficient! ${
                              60 - pageTitle.length
                            } characters available. (${
                              pageTitle.length
                            } of 60 characters used)`,
                            () => "yellow"
                          )
                        : renderHelper(
                            false,
                            `The Page Title is too short, ${
                              60 - pageTitle.length
                            } characters available. (${
                              pageTitle.length
                            } of 60 characters used)`,
                            () => "red"
                          )}
                    </>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "0.5rem",
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 16,
                          minHeight: 16,
                          width: 16,
                          height: 16,
                          marginRight: "0.5rem",
                          backgroundColor: "red",
                          borderRadius: "50%",
                        }}
                      />
                      <Typography variant="body2">
                        Please enter focus keyword into the Keyword field at the
                        start of the form (Enter focus keyword).
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            <Box
              sx={{
                width: "100%",
                marginBottom: "1rem",
              }}
            >
              <TextField
                label="3. Enter Meta Description"
                variant="outlined"
                value={metaDescription}
                fullWidth
                multiline
                rows={4}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  style: { paddingLeft: "5px", paddingTop: "5px" },
                }}
                onChange={handleMetaDescriptionChange}
                onFocus={() => setDescriptionHelperVisibility(true)}
                onBlur={handleDescriptionBlur}
              />

              {descriptionHelperVisibility && (
                <Box
                  sx={{
                    marginTop: "1rem",
                    textAlign: "left",
                  }}
                >
                  {helper.keywordNotEmpty ? (
                    <>
                      {helper.keywordInDescription
                        ? renderHelper(
                            helper.keywordInDescription,
                            `The focus keyword "${keyword}" appears in the Meta description`,
                            () => "green"
                          )
                        : renderHelper(
                            helper.keywordInDescription,
                            `The focus keyword "${keyword}" doesn't appear in the Meta description`,
                            () => "red"
                          )}
                      {helper.descriptionTooLong
                        ? renderHelper(
                            false,
                            `The Meta Description is too long. Remove ${
                              metaDescription.length - 160
                            } characters.`,
                            () => "red"
                          )
                        : helper.descriptionGreat
                        ? renderHelper(
                            true,
                            `The Meta Description length is great! ${
                              160 - metaDescription.length
                            } characters available. (${
                              metaDescription.length
                            } of 160 characters used)`,
                            () => "green"
                          )
                        : helper.descriptionSufficient
                        ? renderHelper(
                            true,
                            `The Meta Description length is sufficient! ${
                              160 - metaDescription.length
                            } characters available. (${
                              metaDescription.length
                            } of 160 characters used)`,
                            () => "yellow"
                          )
                        : renderHelper(
                            false,
                            `The Meta Description is too short, ${
                              160 - metaDescription.length
                            } characters available. (${
                              metaDescription.length
                            } of 160 characters used)`,
                            () => "red"
                          )}
                    </>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "0.5rem",
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 16,
                          minHeight: 16,
                          width: 16,
                          height: 16,
                          marginRight: "0.5rem",
                          backgroundColor: "red",
                          borderRadius: "50%",
                        }}
                      />
                      <Typography variant="body2">
                        Please enter focus keyword into the Keyword field at the
                        start of the form (Enter focus keyword).
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      );
    } else if (activeMenu === "tips") {
      return (
        <Box
          sx={{
            marginTop: "1rem",
            textAlign: "left",
          }}
        >
          <Box sx={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <h4>Page Title score ({calculateTitleScore()})</h4>
            <LinearProgress
              variant="determinate"
              value={calculateTitleScore()}
            />
          </Box>

          {helper.keywordNotEmpty
            ? renderHelper(
                true,
                `The focus keyword "${keyword}" has been set.`,
                () => "green"
              )
            : renderHelper(
                false,
                "No focus keyword has been set.",
                () => "red"
              )}
          {helper.keywordInTitle && helper.keywordNotEmpty
            ? renderHelper(
                helper.keywordInTitle,
                `The focus keyword appears in the Page Title`,
                () => "green"
              )
            : renderHelper(
                false,
                `The focus keyword doesn't appear in the Page Title`,
                () => "red"
              )}
          {helper.keywordAtBeginning && helper.keywordNotEmpty
            ? renderHelper(
                helper.keywordAtBeginning,
                "Focus keyword appears at the beginning of the Page Title",
                () => "green"
              )
            : renderHelper(
                false,
                "Put the focus keyword at the beginning of Page Title",
                () => "red"
              )}
          {helper.titleTooLong
            ? renderHelper(
                false,
                `The Page Title is too long. Remove ${
                  pageTitle.length - 60
                } characters.`,
                () => "red"
              )
            : helper.titleGreat
            ? renderHelper(
                true,
                `The Page Title length is great! ${
                  60 - pageTitle.length
                } characters available. (${
                  pageTitle.length
                } of 60 characters used)`,
                () => "green"
              )
            : helper.titleSufficient
            ? renderHelper(
                true,
                `The Page Title length is sufficient! ${
                  60 - pageTitle.length
                } characters available. (${
                  pageTitle.length
                } of 60 characters used)`,
                () => "yellow"
              )
            : renderHelper(
                false,
                `The Page Title is too short, ${
                  60 - pageTitle.length
                } characters available. (${
                  pageTitle.length
                } of 60 characters used)`,
                () => "red"
              )}

          <Box sx={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <h4>Meta Description score ({calculateDescriptionScore()})</h4>
            <LinearProgress
              variant="determinate"
              value={calculateDescriptionScore()}
            />
          </Box>

          {helper.keywordNotEmpty
            ? renderHelper(
                true,
                `The focus keyword "${keyword}" has been set.`,
                () => "green"
              )
            : renderHelper(
                false,
                "No focus keyword has been set.",
                () => "red"
              )}

          {helper.keywordInDescription && helper.keywordNotEmpty
            ? renderHelper(
                helper.keywordInTitle,
                `The focus keyword appears in the Meta Description`,
                () => "green"
              )
            : renderHelper(
                false,
                `The focus keyword doesn't appear in the Meta Description`,
                () => "red"
              )}

          {helper.descriptionTooLong
            ? renderHelper(
                false,
                `The Meta Description is too long. Remove ${
                  metaDescription.length - 160
                } characters.`,
                () => "red"
              )
            : helper.descriptionGreat
            ? renderHelper(
                true,
                `The Meta Description length is great! ${
                  160 - metaDescription.length
                } characters available. (${
                  metaDescription.length
                } of 160 characters used)`,
                () => "green"
              )
            : helper.descriptionSufficient
            ? renderHelper(
                true,
                `The Meta Description length is sufficient! ${
                  160 - metaDescription.length
                } characters available. (${
                  metaDescription.length
                } of 160 characters used)`,
                () => "yellow"
              )
            : renderHelper(
                false,
                `The Meta Description is too short, ${
                  160 - metaDescription.length
                } characters available. (${
                  metaDescription.length
                } of 160 characters used)`,
                () => "red"
              )}

          <Box sx={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <h4>Content score ({calculateContentScore()})</h4>
            <LinearProgress
              variant="determinate"
              value={calculateContentScore()}
            />
          </Box>

          {h1Check
            ? renderHelper(true, `You've added a H1. Good job!`, () => "green")
            : renderHelper(
                false,
                "You should add a H1 tag to your content.",
                () => "red"
              )}

          {keywordInH1 && helper.keywordNotEmpty
            ? renderHelper(
                true,
                `The focus keyword '${keyword}' appears in the H1!`,
                () => "green"
              )
            : renderHelper(
                false,
                `The focus keyword doesn't appear in H1`,
                () => "red"
              )}

          {textWithoutHTML !== ""
            ? renderHelper(
                true,
                `You've added text to your content.`,
                () => "green"
              )
            : renderHelper(
                false,
                "Your content does not contain any text.",
                () => "red"
              )}

          {wordCount >= 300
            ? renderHelper(
                true,
                `Your text contains ${wordCount} words, which is above the recommended minimum of 300.`,
                () => "green"
              )
            : renderHelper(
                false,
                `Your text contains ${wordCount} words. Add more content to reach the recommended minimum of 300 words.`,
                () => "red"
              )}

          {keywordInFirstParagraph &&
          textWithoutHTML !== "" &&
          helper.keywordNotEmpty
            ? renderHelper(
                true,
                `Your first paragraph contains the keyword '${keyword}'.`,
                () => "green"
              )
            : renderHelper(
                false,
                `Your first paragraph does not contain the focused keyword. Consider adding it for better SEO.`,
                () => "red"
              )}

          {imgCheck
            ? renderHelper(
                true,
                `Your text contains image, which is good for SEO.`,
                () => "green"
              )
            : renderHelper(
                false,
                `Your text does not contain any image. Consider adding some for better SEO.`,
                () => "red"
              )}

          {helper.keywordInImgAlt && helper.keywordNotEmpty
            ? renderHelper(
                true,
                `Your images have alt attributes that contain the keyword '${keyword}', which is good for SEO.`,
                () => "green"
              )
            : renderHelper(
                false,
                `Your images do not have alt attributes containing the focused keyword. Consider adding them for better SEO.`,
                () => "red"
              )}

          {linkCheck
            ? renderHelper(
                true,
                `Your text contains links, which is good for SEO.`,
                () => "green"
              )
            : renderHelper(
                false,
                `Your text does not contain any links. Consider adding some for better SEO.`,
                () => "red"
              )}

          {helper.keywordNotEmpty ? (
            <>
              {wordCount > 0 &&
              actualDensity >= desiredMinDensity &&
              actualDensity <= desiredMaxDensity
                ? renderHelper(
                    true,
                    `The keyword '${keyword}' is used ${keywordOccurrences} times, maintaining a keyword density of ${actualDensity.toFixed(
                      2
                    )}%. This is within the optimal range of ${desiredMinDensity}% - ${desiredMaxDensity}%.`,
                    () => "green"
                  )
                : wordCount > 0 && actualDensity < desiredMinDensity
                ? renderHelper(
                    false,
                    `The keyword '${keyword}' is only used ${keywordOccurrences} times, resulting in a keyword density of ${actualDensity.toFixed(
                      2
                    )}%. For better SEO, try to use it more frequently to reach the desired keyword density range of ${desiredMinDensity}% - ${desiredMaxDensity}%.`,
                    () => "red"
                  )
                : wordCount > 0 && actualDensity > desiredMaxDensity
                ? renderHelper(
                    false,
                    `The keyword '${keyword}' is used ${keywordOccurrences} times, resulting in a keyword density of ${actualDensity.toFixed(
                      2
                    )}%. This is above the optimal range and could lead to keyword stuffing. Try to reduce the usage of the keyword to maintain a density within the range of ${desiredMinDensity}% - ${desiredMaxDensity}%.`,
                    () => "red"
                  )
                : renderHelper(
                    false,
                    "There are no words in the text. Please add content.",
                    () => "red"
                  )}
            </>
          ) : (
            renderHelper(false, "No focus keyword has been set.", () => "red")
          )}

          {keywordInImgName && helper.keywordNotEmpty
            ? renderHelper(
                true,
                `Your images' filenames contain the keyword '${keyword}', which is good for SEO.`,
                () => "green"
              )
            : renderHelper(
                false,
                `Your images' filenames do not contain the focused keyword. Consider renaming them for better SEO.`,
                () => "red"
              )}
        </Box>
      );
    }
  };

  return (
    <Box
      sx={{
        width: 370,
        height: "100vh",
        backgroundColor: "#fff",
        borderRight: "1px solid #ddd",
        padding: "1rem",
      }}
    >
      <List>
        <ListItem
          button
          selected={activeMenu === "input"}
          onClick={() => setActiveMenu("input")}
        >
          <ListItemText primary="Input" />
        </ListItem>
        <ListItem
          button
          selected={activeMenu === "tips"}
          onClick={() => setActiveMenu("tips")}
        >
          <ListItemText primary="SEO Optimization tips" />
        </ListItem>
      </List>
      <Box
        sx={{
          borderBottom: "1px solid #ddd",
          paddingBottom: "1rem",
          marginBottom: "1rem",
        }}
      ></Box>
      {renderContent()}
    </Box>
  );
};

export default SideBar;
